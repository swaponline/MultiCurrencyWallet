import debug from 'debug'
import crypto from 'bitcoinjs-lib/src/crypto' // move to BtcSwap
import SwapApp, { constants } from 'swap.app'
import { Flow } from 'swap.swap'


export default (tokenName) => {

  class ETHTOKEN2USDT extends Flow {

    static getName() {
      return `${this.getFromName()}2${this.getToName()}`
    }
    static getFromName() {
      return tokenName.toUpperCase()
    }
    static getToName() {
      return constants.COINS.usdt
    }
    constructor(swap) {
      super(swap)

      this._flowName = ETHTOKEN2USDT.getName()

      this.ethTokenSwap = this.app.swaps[tokenName.toUpperCase()]
      this.usdtSwap      = this.app.swaps[constants.COINS.usdt]

      this.myBtcAddress = this.app.services.auth.accounts.btc.getAddress()
      this.myEthAddress = this.app.getMyEthAddress()

      this.stepNumbers = {
        'sign': 1,
        'wait-lock-usdt': 2,
        'verify-script': 3,
        'sync-balance': 4,
        'lock-eth': 5,
        'wait-withdraw-eth': 6, // aka getSecret
        'withdraw-usdt': 7,
        'finish': 8,
        'end': 9
      }

      if (!this.ethTokenSwap) {
        throw new Error('ETHTOKEN2USDT: "ethTokenSwap" of type object required')
      }
      if (!this.usdtSwap) {
        throw new Error('ETHTOKEN2USDT: "usdtSwap" of type object required')
      }

      this.state = {
        step: 0,

        signTransactionHash: null,
        isSignFetching: false,
        isMeSigned: false,

        secretHash: null,
        usdtScriptValues: null,

        usdtScriptVerified: false,

        isBalanceFetching: false,
        isBalanceEnough: false,
        balance: null,

        usdtFundingTransactionHash: null,

        ethSwapCreationTransactionHash: null,
        usdtSwapWithdrawTransactionHash: null,

        isEthContractFunded: false,

        secret: null,

        isEthWithdrawn: false,
        isBtcWithdrawn: false,

        refundTransactionHash: null,

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

        // 1. Sign swap to start

        () => {
          // this.sign()
        },

        // 2. Wait participant create, fund USDT Script

        () => {
          flow.swap.room.once('create btc script', ({ scriptValues, usdtFundingTransactionHash }) => {
            flow.finishStep({
              secretHash: scriptValues.secretHash,
              usdtScriptValues: scriptValues,
              usdtFundingTransactionHash,
            }, { step: 'wait-lock-usdt', silentError: true })
          })

          flow.swap.room.sendMessage({
            event: 'request btc script'
          })
        },

        // 3. Verify USDT Script

        () => {
          // this.verifyBtcScript()
        },

        // 4. Check balance

        () => {
          this.syncBalance()
        },

        // 5. Create ETH Contract

        async () => {
          const { participant, buyAmount, sellAmount } = flow.swap
          let ethSwapCreationTransactionHash

          // TODO move this somewhere!
          const utcNow = () => Math.floor(Date.now() / 1000)
          const getLockTime = () => utcNow() + 3600 * 1 // 1 hour from now

          const scriptValues = {
            scriptValues: flow.state.usdtScriptValues,
            fundingTxHash: flow.state.usdtFundingTransactionHash,
          }

          const scriptCheckResult = await flow.usdtSwap.checkScript(scriptValues, {
            amount: buyAmount,
            recipientPublicKey: this.app.services.auth.accounts.btc.getPublicKey(),
            lockTime: getLockTime(),
          })

          if (scriptCheckResult) {
            console.error(`Btc script check error:`, scriptCheckResult)
            flow.swap.events.dispatch('usdt script check error', scriptCheckResult)
            return
          }

          const swapData = {
            participantAddress:   participant.eth.address,
            secretHash:           flow.state.secretHash,
            amount:               sellAmount,
          }

          debug('swap.core:flow')('approve')

          await flow.ethTokenSwap.approve({
            amount: sellAmount,
          }, hash => {
            debug('swap.core:flow')('approve tx hash', hash)
          })

          debug('swap.core:flow')('create swap')

          await flow.ethTokenSwap.create(swapData, (hash) => {
            ethSwapCreationTransactionHash = hash

            debug('swap.core:flow')('create swap tx hash', hash)

            flow.setState({
              ethSwapCreationTransactionHash: hash,
            })
          })

          flow.swap.room.sendMessage({
            event: 'create eth contract',
            data: {
              ethSwapCreationTransactionHash,
            }
          })

          flow.finishStep({
            isEthContractFunded: true,
          })
        },

        // 6. Wait participant withdraw

        () => {
          const { participant } = flow.swap

          const checkSecretExist = async () => {
            try {
              const secret = await flow.ethTokenSwap.getSecret({
                participantAddress: participant.eth.address,
              })

              if (secret) {
                clearInterval(checkSecretTimer)

                if (flow.state.secret && secret !== flow.state.secret) {
                  throw new Error(`Secret already exists and it differs! ${secret} ≠ ${flow.state.secret}`)
                }

                flow.finishStep({
                  secret,
                  isEthWithdrawn: true,
                }, { step: 'wait-withdraw-eth' })
              }
            }
            catch (err) { console.error(err) }
          }

          const checkSecretTimer = setInterval(checkSecretExist, 20 * 1000)

          flow.swap.room.once('finish eth withdraw', () => {
            checkSecretExist()
          })
        },

        // 7. Withdraw

        async () => {
          const { participant, buyAmount } = flow.swap
          const { secret } = flow.state

          // if there is still no secret stop withdraw
          if (!secret) {
            console.error(`Secret required! Got ${secret}`)
            return
          }

          try {
            await flow.usdtSwap.redeemScript({
              scriptValues: flow.state.usdtScriptValues,
              secret,
              amount: buyAmount,
            }, (hash) => {
              debug('swap.core:flow')('withdraw tx hash', hash)

              flow.setState({
                usdtSwapWithdrawTransactionHash: hash,
              })
            })
          } catch (err) {
            console.error(err)
            return
          }

          flow.finishStep({
            isBtcWithdrawn: true,
          })
        },


        // 8. Finish

        () => {
          flow.swap.room.sendMessage({
            event: 'swap finished'
          })

          flow.finishStep({
            isFinished: true
          })
        },

        // 9. Finished!

        () => {

        },
      ]
    }

    _checkSwapAlreadyExists() {
      const { participant } = this.swap

      const swapData = {
        ownerAddress:       this.app.getMyEthAddress(),
        participantAddress: participant.eth.address
      }

      return this.ethTokenSwap.checkSwapExists(swapData)
    }

    async sign() {
      const { participant } = this.swap
      const { isMeSigned } = this.state

      if (isMeSigned) return this.swap.room.sendMessage({
          event: 'swap sign'
        })

      const swapExists = await this._checkSwapAlreadyExists()

      if (swapExists) {
        this.swap.room.sendMessage({
          event: 'swap exists'
        })
        // TODO go to 6 step automatically here
        throw new Error(`Cannot sign: swap with ${participant.eth.address} already exists! Please refund it or drop ${this.swap.id}`)
        return false
      }

      this.setState({
        isSignFetching: true,
      })

      this.swap.room.once('request sign', () => {
        this.swap.room.sendMessage({
          event: 'swap sign'
        })
      })

      this.swap.room.sendMessage({
        event: 'swap sign'
      })

      this.finishStep({
        isMeSigned: true,
      }, { step: 'sign' })

      return true
    }

    verifyBtcScript() {
      if (this.state.usdtScriptVerified) return true
      if (!this.state.usdtScriptValues)
        throw new Error(`No script, cannot verify`)

      this.finishStep({
        usdtScriptVerified: true,
      }, { step: 'verify-script' })

      return true
    }

    async syncBalance() {
      const { sellAmount } = this.swap

      this.setState({
        isBalanceFetching: true,
      })

      const balance = await this.ethTokenSwap.fetchBalance(this.app.getMyEthAddress())
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

    async tryWithdraw(_secret) {
      const { secret, secretHash, isEthWithdrawn, isBtcWithdrawn, usdtScriptValues } = this.state

      if (!_secret)
        throw new Error(`Withdrawal is automatic. For manual withdrawal, provide a secret`)

      if (!usdtScriptValues)
        throw new Error(`Cannot withdraw without script values`)

      if (secret && secret != _secret)
        console.warn(`Secret already known and is different. Are you sure?`)

      if (isBtcWithdrawn)
        console.warn(`Looks like money were already withdrawn, are you sure?`)

      debug('swap.core:flow')(`WITHDRAW using secret = ${_secret}`)

      const _secretHash = crypto.ripemd160(Buffer.from(_secret, 'hex')).toString('hex')

      if (secretHash != _secretHash)
        console.warn(`Hash does not match!`)

      const { scriptAddress } = this.usdtSwap.createScript(usdtScriptValues)

      const balance = await this.usdtSwap.getBalance(scriptAddress)

      debug('swap.core:flow')(`address=${scriptAddress}, balance=${balance}`)

      if (balance === 0) {
        flow.finishStep({
          isBtcWithdrawn: true,
        }, { step: 'withdraw-usdt' })

        throw new Error(`Already withdrawn: address=${scriptAddress},balance=${balance}`)
      }

      await this.usdtSwap.withdraw({
        scriptValues: usdtScriptValues,
        secret: _secret,
        amount: this.swap.buyAmount,
      }, (hash) => {
        debug('swap.core:flow')(`TX hash=${hash}`)
        this.setState({
          usdtSwapWithdrawTransactionHash: hash,
        })
      })

      debug('swap.core:flow')(`TX withdraw sent: ${this.state.usdtSwapWithdrawTransactionHash}`)

      this.finishStep({
        isBtcWithdrawn: true,
      }, { step: 'withdraw-usdt' })
    }

    async isRefundSuccess() {
      return true
    }

    async tryRefund() {
      const { participant } = this.swap
      let { secret, usdtScriptValues } = this.state

      try {
        debug('swap.core:flow')('TRYING REFUND!')

        try {
          await this.ethTokenSwap.refund({
            participantAddress: participant.eth.address,
          }, (hash) => {
            this.setState({
              refundTransactionHash: hash,
            })
          })

          debug('swap.core:flow')('SUCCESS REFUND!')
          return
        }
        catch (err) {
          console.error('REFUND FAILED!', err)
        }
      }
      catch (err) {
        console.error(`Mbe it's still under lockTime?! ${err}`)
      }

      if (!usdtScriptValues) {
        console.error('You can\'t do refund w/o usdt script values! Try wait until lockTime expires on eth contract!')
      }

      if (!secret) {
        try {
          secret = await this.ethTokenSwap.getSecret(data)
        }
        catch (err) {
          console.error('Can\'t receive secret from contract')
          return
        }
      }

      debug('swap.core:flow')('TRYING WITHDRAW!')

      try {
        await this.usdtSwap.withdraw({
          amount: this.swap.buyAmount,
          scriptValues: this.state.usdtScriptValues,
          secret,
        }, (hash) => {
          this.setState({
            usdtSwapWithdrawTransactionHash: hash,
          })
        })

        debug('swap.core:flow')('SUCCESS WITHDRAW!')
      }
      catch (err) {
        console.error('WITHDRAW FAILED!', err)
      }
    }
  }

  return ETHTOKEN2USDT
}
