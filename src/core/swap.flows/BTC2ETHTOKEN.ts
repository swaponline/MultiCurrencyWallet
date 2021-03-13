import debug from 'debug'
import SwapApp, { constants, util } from 'swap.app'
import { AtomicAB2UTXO } from 'swap.swap'
import { BigNumber } from 'bignumber.js'
import { EthTokenSwap, BtcSwap } from 'swap.swaps'


export default (tokenName) => {

  class BTC2ETHTOKEN extends AtomicAB2UTXO {

    _flowName: string
    ethTokenSwap: EthTokenSwap
    btcSwap: BtcSwap
    state: any

    static getName() {
      return `${this.getFromName()}2${this.getToName()}`
    }
    static getFromName() {
      return constants.COINS.btc
    }
    static getToName() {
      return tokenName.toUpperCase()
    }
    constructor(swap) {
      super(swap)
      this.utxoCoin = `btc`
      this._flowName = BTC2ETHTOKEN.getName()

      this.isUTXOSide = true
      this.isTakerMakerModel = true
      this.setupTakerMakerEvents()

      this.stepNumbers = this.getStepNumbers()

      this.ethTokenSwap = swap.ownerSwap
      this.btcSwap      = swap.participantSwap

      this.abBlockchain = this.ethTokenSwap
      this.utxoBlockchain = this.btcSwap

      if (!this.ethTokenSwap) {
        throw new Error('BTC2ETH: "ethTokenSwap" of type object required')
      }
      if (!this.btcSwap) {
        throw new Error('BTC2ETH: "btcSwap" of type object required')
      }

      this.state = {
        step: 0,

        isStoppedSwap: false,

        signTransactionHash: null,
        isSignFetching: false,
        isParticipantSigned: false,

        ethSwapCreationTransactionHash: null,

        secretHash: null,

        isBalanceFetching: false,
        isBalanceEnough: true,
        balance: null,

        isEthContractFunded: false,

        utxoSwapWithdrawTransactionHash: null,
        ethSwapWithdrawTransactionHash: null,

        secret: null,

        canCreateEthTransaction: true,
        isEthWithdrawn: false,

        refundTransactionHash: null,
        isRefunded: false,

        withdrawFee: null,
        refundTxHex: null,
        isFinished: false,
        isSwapExist: false,
        utxoFundError: null,
      }

      this._persistState()
      super._persistSteps()
    }

    _persistState() {
      super._persistState()
    }

    _getSteps() {
      const flow = this

      if (this.isTaker()) {
        return [

          // 1. Signs

          async () => {
            this.signUTXOSide()
          },

          // 2. Create secret, secret hash and BTC script

          () => {
            this.submitSecret()
          },

          // 3. Check system wallet balance

          () => {
            this.syncBalance()
          },

          // 4. Create BTC Script, fund, notify participant

          async () => {
            await this.btcSwap.fundSwapScript({
              flow,
            })
          },

          // 5. Wait participant creates ETH Contract

          async () => {
            await this.ethTokenSwap.waitAB2UTXOContract({
              flow,
              utxoCoin: `btc`,
            })
          },

          // 6. Withdraw

          async () => {
            await flow.ethTokenSwap.withdrawFromABContract({ flow })
          },

          // 7. Finish

          () => {
            flow.swap.room.once('swap finished', ({utxoSwapWithdrawTransactionHash}) => {
              flow.setState({
                utxoSwapWithdrawTransactionHash,
              })
            })

            flow.swap.room.sendMessage({
              event: 'request swap finished',
            })

            flow.finishStep({
              isFinished: true,
            }, 'finish')
          },

          // 8. Finished!

          () => {}
        ]
      } else {
        return [
        // 1 - `sign` Signs
        async () => {
          console.log('>>>> MAKER - sign')
          this.swap.processMetamask()
          this.sign()
        },

        // 2 - `sync-balance` - syncBalance
        async () => {
          console.log('>>>> MAKER - sync balance')
          this.syncBalance()
        },

        // 3 - `wait-lock-eth` - wait taker create AB - обмен хешем
        async () => {
          console.log('>>>> MAKER - wait lock erc')
          this.swap.room.once('create eth contract', async ({
            ethSwapCreationTransactionHash,
          }) => {
            flow.setState({
              ethSwapCreationTransactionHash,
            }, true)
          })

          await util.helpers.repeatAsyncUntilResult(async () => {
            console.log('>>>> MAKER - erc locked - check')
            // @to-do - check amount in isContractFunded
            if (this.ethTokenSwap.isContractFunded(this)) {
              console.log('>>>> MAKER - erc locked - check destination')
              const destAddressIsOk = await this.ethTokenSwap.checkTargetAddress({ flow })

              if (destAddressIsOk) {
                console.log('>>>> MAKER - destination ok')
                this.finishStep({
                  isEthContractFunded: true,
                }, 'wait-lock-eth`')
                return true
              } else {
                console.warn('Destination address not valid. Stop swap now!')
              }
            }
            return false
          })
        },

        // 4 - `lock-utxo` - create UTXO
        async () => {
          // Repeat until 
          console.log('>>>> MAKER - lock utxo')
          await util.helpers.repeatAsyncUntilResult(async () => {
            const {
              secretHash,
              utxoScriptValues
            } = flow.state
            if (secretHash && utxoScriptValues) {
              console.log('>>>> MAKER - secret hash ok - locking utxo')
              await this.btcSwap.fundSwapScript({
                flow,
              })
              return true
            } else {
              console.log('>>>> MAKER - need script values')
              flow.swap.room.sendMessage({
                event: 'request utxo script',
              })
              return false
            }
          })
        },

        // 5 - `wait-withdraw-utxo` - wait withdraw UTXO - fetch secret from TX - getSecretFromTxhash
        async () => {
          console.log('>>>> MAKER - wait withdraw utxo')
          await util.helpers.repeatAsyncUntilResult(async () => {
            // check withdraw
            const {
              utxoScriptValues,
            } = this.state
            const { scriptAddress } = this.utxoBlockchain.createScript(utxoScriptValues)

            const utxoWithdrawData = await this.btcSwap.checkWithdraw(scriptAddress)

            if (utxoWithdrawData) {
              console.log('>>>> MAKER - utxo withdrawed - extract secret')
              const {
                txid: utxoSwapWithdrawTransactionHash,
              } = utxoWithdrawData

              const secret = await this.btcSwap.getSecretFromTxhash(utxoSwapWithdrawTransactionHash)
              if (secret) {
                console.log('>>>> MAKER - secret getted')
                this.finishStep({
                  secret,
                  utxoSwapWithdrawTransactionHash,
                }, 'wait-withdraw-utxo')
              }
              return true
            } else {
              return false
            }
          })
        },

        // 6 - `withdraw-eth` - withdraw from AB
        async () => {
          console.log('>>>> MAKER - withdraw erc')
          await flow.ethTokenSwap.withdrawFromABContract({ flow })
        },

        // 7 - `finish`
        async () => {
          // @to-do - txids room events
          console.log('>>>> MAKER - ready')
          flow.finishStep({
            isFinished: true,
          }, 'finish')
        },

        // 8 - `end`
        async () => {
          
        },
      ]
      }
    }

    async skipSyncBalance() {
      this.finishStep({}, { step: 'sync-balance' })
    }

    getRefundTxHex = () => {
      this.btcSwap.getRefundHexTransaction({
        scriptValues: this.state.utxoScriptValues,
        secret: this.state.secret,
      })
        .then((txHex) => {
          this.setState({
            refundTxHex: txHex,
          })
        })
    }

    tryRefund() {
      const flow = this
      const { utxoScriptValues, secret } = flow.state

      return flow.btcSwap.refund({
        scriptValues: utxoScriptValues,
        secret: secret,
      })
        .then((hash) => {
          if (!hash) {
            return false
          }

          this.swap.room.sendMessage({
            event: 'utxo refund completed',
          })

          flow.setState({
            refundTransactionHash: hash,
            isRefunded: true,
            isSwapExist: false,
          }, true)

          return true
        })
        .catch((error) => {
          if (/Address is empty/.test(error)) {
            // TODO - fetch TX list to script for refund TX
            flow.setState({
              isRefunded: true,
              isSwapExist: false,
            }, true)
            return true
          } else {
            console.warn('Btc refund:', error)

            return false
          }
        })
    }

    async isRefundSuccess() {
      const { refundTransactionHash, isRefunded } = this.state
      if (refundTransactionHash && isRefunded) {
        if (await this.btcSwap.checkTX(refundTransactionHash)) {
          return true
        } else {
          console.warn('BTC2ETHTOKEN - unknown refund transaction')
          this.setState( {
            refundTransactionHash: null,
            isRefunded: false,
          } )
          return false
        }
      }
      return false
    }

    async tryWithdraw(_secret) {
      const { secret, secretHash, isEthWithdrawn } = this.state

      if (!_secret)
        throw new Error(`Withdrawal is automatic. For manual withdrawal, provide a secret`)

      if (secret && secret != _secret)
        console.warn(`Secret already known and is different. Are you sure?`)

      if (isEthWithdrawn)
        console.warn(`Looks like money were already withdrawn, are you sure?`)

      debug('swap.core:flow')(`WITHDRAW using secret = ${_secret}`)

      const _secretHash = this.app.env.bitcoin.crypto.ripemd160(Buffer.from(_secret, 'hex')).toString('hex')

      if (secretHash != _secretHash)
        console.warn(`Hash does not match! state: ${secretHash}, given: ${_secretHash}`)

      const data = {
        ownerAddress: this.app.getParticipantEthAddress(this.swap),
        secret: _secret,
      }

      await this.ethTokenSwap.withdraw(data, (hash) => {
        debug('swap.core:flow')(`TX hash=${hash}`)
        this.setState({
          ethSwapWithdrawTransactionHash: hash,
          canCreateEthTransaction: true,
        })
      }).then(() => {

        this.finishStep({
          isEthWithdrawn: true,
        }, 'withdraw-eth')
      })
    }
  }

  return BTC2ETHTOKEN
}
