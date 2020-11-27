import debug from 'debug'
import crypto from 'bitcoinjs-lib/src/crypto'
import SwapApp, { constants } from 'swap.app'
import { Flow } from 'swap.swap'


export default (tokenName) => {

  class USDT2ETHTOKEN extends Flow {

    _flowName: string
    ethTokenSwap: any
    usdtSwap: any
    myBtcAddress: any
    myEthAddress: any
    state: any

    static getName() {
      return `${this.getFromName()}2${this.getToName()}`
    }
    static getFromName() {
      return constants.COINS.usdt
    }
    static getToName() {
      return tokenName.toUpperCase()
    }
    constructor(swap) {
      super(swap)

      this._flowName = USDT2ETHTOKEN.getName()

      this.ethTokenSwap = this.app.swaps[tokenName.toUpperCase()]
      this.usdtSwap      = this.app.swaps[constants.COINS.usdt]

      this.myBtcAddress = this.app.services.auth.accounts.btc.getAddress()
      this.myEthAddress = this.app.getMyEthAddress()

      this.stepNumbers = {
        'sign': 1,
        'submit-secret': 2,
        'sync-balance': 3,
        'lock-usdt': 4,
        'wait-lock-eth': 5,
        'withdraw-eth': 6,
        'finish': 7,
        'end': 8
      }

      if (!this.ethTokenSwap) {
        throw new Error('USDT2ETH: "ethTokenSwap" of type object required')
      }
      if (!this.usdtSwap) {
        throw new Error('USDT2ETH: "usdtSwap" of type object required')
      }

      this.state = {
        step: 0,

        signTransactionHash: null,
        isSignFetching: false,
        isParticipantSigned: false,

        // btcScriptCreatingTransactionHash: null,
        usdtFundingTransactionHash: null,
        usdtFundingTransactionValues: null,

        ethSwapCreationTransactionHash: null,

        secretHash: null,
        usdtScriptValues: null,

        usdtScriptVerified: false,

        isBalanceFetching: false,
        isBalanceEnough: false,
        balance: null,

        isEthContractFunded: false,

        ethSwapWithdrawTransactionHash: null,
        isEthWithdrawn: false,
        isBtcWithdrawn: false,

        refundTxHex: null,
        isFinished: false,
      }

      this._persistState()
      super._persistSteps()
    }

    _persistState() {
      super._persistState()
    }

    _getSteps() {
      const flow = this

      return [

        // 1. Signs

        () => {
          flow.swap.room.once('swap sign', () => {
            debug('swap.core:flow')('swap sign!')
            flow.finishStep({
              isParticipantSigned: true,
            }, { step: 'sign', silentError: true })
          })

          flow.swap.room.once('swap exists', () => {
            debug('swap.core:flow')(`swap already exists`)
          })

          // if I came late and he ALREADY send this, I request AGAIN
          flow.swap.room.sendMessage({
            event: 'request sign',
          })
        },

        // 2. Create secret, secret hash

        () => {
          // this.submitSecret()
        },

        // 3. Check balance

        () => {
          this.syncBalance()
        },

        // 4. Create USDT Script, fund, notify participant

        async () => {
          const { sellAmount, participant } = flow.swap
          const { usdtScriptValues } = flow.state

          // TODO move this somewhere!
          const utcNow = () => Math.floor(Date.now() / 1000)
          const getLockTime = () => utcNow() + 3600 * 3 // 3 hours from now

          let scriptValues

          if (!usdtScriptValues) {
            scriptValues = {
              secretHash:         flow.state.secretHash,
              ownerPublicKey:     this.app.services.auth.accounts.btc.getPublicKey(),
              recipientPublicKey: participant.btc.publicKey,
              lockTime:           getLockTime(),
            }

            flow.setState({
              usdtScriptValues: scriptValues,
            })
          } else {
            scriptValues = usdtScriptValues
          }

          debug('swap.core:flow')('sellAmount', sellAmount)
          debug('swap.core:flow')('scriptValues', scriptValues)

          let usdtFundingTransactionHash, usdtFunding

          let fundingValues

          if (flow.state.usdtFundingTransactionValues) {
            fundingValues = flow.state.usdtFundingTransactionValues
          } else {
            await flow.usdtSwap.fundScript(
              { scriptValues, amount: sellAmount },
              (hash, funding) => {
                usdtFundingTransactionHash = hash
                fundingValues = {
                  txid: hash,
                  scriptAddress: funding.scriptValues.scriptAddress,
                }

                flow.setState({
                  usdtFundingTransactionValues: fundingValues,
                  usdtFundingTransactionHash: hash,
                })
              })
          }


          flow.swap.room.on('request btc script', () => {
            flow.swap.room.sendMessage({
              event: 'create btc script',
              data: {
                scriptValues,
                fundingValues,
                usdtFundingTransactionHash,
              }
            })
          })

          flow.swap.room.sendMessage({
            event: 'create btc script',
            data: {
              scriptValues,
              usdtFundingTransactionHash,
            }
          })

          flow.finishStep({
            isBtcScriptFunded: true,
            usdtScriptValues: scriptValues,
          })

          // leave only when we have and the party has all values
          // scriptValues: secretHash, lockTime
          // funding: txHash
          // redeem: txHex
        },

        // 5. Wait participant creates ETH Contract

        () => {
           const { buyAmount, participant } = flow.swap

           flow.swap.room.once('create eth contract', ({ ethSwapCreationTransactionHash }) => {
             flow.setState({
               ethSwapCreationTransactionHash,
             })
           })

           const checkContractBalance = async () => {
             const balanceCheckResult = await flow.ethTokenSwap.checkBalance({
               ownerAddress: participant.eth.address,
               expectedValue: buyAmount,
             })

             if (balanceCheckResult) {
               console.error(`Waiting until deposit: ETH balance check error:`, balanceCheckResult)
               flow.swap.events.dispatch('eth balance check error', balanceCheckResult)
             } else {
               clearInterval(checkBalanceTimer)

               if (!flow.state.isEthContractFunded) {
                 flow.finishStep({
                   isEthContractFunded: true,
                 }, { step: 'wait-lock-eth' })
               }
             }
           }

           const checkBalanceTimer = setInterval(checkContractBalance, 20 * 1000)

           flow.swap.room.once('create eth contract', () => {
             checkContractBalance()
           })
        },

        // 6. Withdraw

        async () => {
          if (flow.state.isEthWithdrawn) {
            flow.finishStep()
          }

          const tokenAddressIsValid = await flow.ethTokenSwap.checkTokenIsValid({
            ownerAddress: flow.swap.participant.eth.address,
            participantAddress: this.app.getMyEthAddress(),
          })

          if (!tokenAddressIsValid) {
            console.error("Tokens, blocked at contract dismatch with needed. Stop swap now!")
            return
          }

          const data = {
            ownerAddress:   flow.swap.participant.eth.address,
            secret:         flow.state.secret,
          }

          try {
            await flow.ethTokenSwap.withdraw(data, (hash) => {
              debug('swap.core:flow')('withdraw tx hash', hash)

              flow.setState({
                ethSwapWithdrawTransactionHash: hash,
              })
            })
          } catch (err) {
            // TODO user can stuck here after page reload...
            if ( !/known transaction/.test(err.message) ) console.error(err)
            return
          }

          flow.swap.room.sendMessage({
            event: 'finish eth withdraw',
          })

          flow.finishStep({
            isEthWithdrawn: true,
          })
        },

        // 7. Finish

        () => {
          flow.swap.room.once('swap finished', () => {
            flow.finishStep({
              isFinished: true,
            })
          })
        },

        // 8. Finished!
        () => {

        }
      ]
    }

    submitSecret(secret) {
      if (this.state.secretHash) return true
      if (!this.state.isParticipantSigned)
        throw new Error(`Cannot proceed: participant not signed. step=${this.state.step}`)

      const secretHash = crypto.ripemd160(Buffer.from(secret, 'hex')).toString('hex')

      this.finishStep({
        secret,
        secretHash,
      }, { step: 'submit-secret' })

      return true
    }

    async syncBalance() {
      const { sellAmount } = this.swap

      this.setState({
        isBalanceFetching: true,
      })

      const balance = await this.usdtSwap.fetchBalance(this.app.services.auth.accounts.btc.getAddress())
      const isEnoughMoney = sellAmount.isLessThanOrEqualTo(balance)

      if (isEnoughMoney) {
        this.finishStep({
          balance,
          isBalanceFetching: false,
          isBalanceEnough: true,
        }, { step: 'sync-balance' })
      }
      else {
        this.setState({
          balance,
          isBalanceFetching: false,
          isBalanceEnough: false,
        })
      }
    }

    getRefundTxHex = () => {
      this.usdtSwap.getRefundHexTransaction({
        scriptValues: this.state.usdtScriptValues,
        secret: this.state.secret,
      })
        .then((txHex) => {
          this.setState({
            refundTxHex: txHex,
          })
        })
    }

    async isRefundSuccess() {
      return true
    }

    tryRefund() {
      return this.usdtSwap.refund({
        amount: this.swap.sellAmount.toNumber(),
        scriptValues: this.state.usdtScriptValues,
        secret: this.state.secret,
      }, (hash) => {
        this.setState({
          refundTransactionHash: hash,
        })
      })
      .then(() => {
        this.setState({
          isRefunded: true,
        })
      })
    }
  }

  return USDT2ETHTOKEN
}
