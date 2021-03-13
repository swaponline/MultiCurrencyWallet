import debug from 'debug'
import SwapApp, { constants, util } from 'swap.app'
import { AtomicAB2UTXO } from 'swap.swap'
import BigNumber from 'bignumber.js'
import { EthTokenSwap, BtcSwap } from 'swap.swaps'


export default (tokenName) => {

  class ETHTOKEN2BTC extends AtomicAB2UTXO {

    _flowName: string
    ethTokenSwap: EthTokenSwap
    btcSwap: BtcSwap
    state: any

    static getName() {
      return `${this.getFromName()}2${this.getToName()}`
    }
    static getFromName() {
      return tokenName.toUpperCase()
    }
    static getToName() {
      return constants.COINS.btc
    }
    constructor(swap) {
      super(swap)
      this.utxoCoin = `btc`
      this._flowName = ETHTOKEN2BTC.getName()

      this.isTakerMakerModel = true
      this.setupTakerMakerEvents()
      this.stepNumbers = this.getStepNumbers()

      this.ethTokenSwap = swap.participantSwap
      this.btcSwap = swap.ownerSwap

      this.abBlockchain = this.ethTokenSwap
      this.utxoBlockchain = this.btcSwap

      if (!this.ethTokenSwap) {
        throw new Error('ETHTOKEN2BTC: "ethTokenSwap" of type object required')
      }
      if (!this.btcSwap) {
        throw new Error('ETHTOKEN2BTC: "btcSwap" of type object required')
      }

      this.state = {
        step: 0,

        isStoppedSwap: false,

        signTransactionHash: null,
        isSignFetching: false,
        isMeSigned: false,

        targetWallet : null,
        secretHash: null,

        isBalanceFetching: false,
        isBalanceEnough: true,
        balance: null,

        ethSwapCreationTransactionHash: null,
        canCreateEthTransaction: true,
        isEthContractFunded: false,

        secret: null,

        isEthWithdrawn: false,
        isbtcWithdrawn: false,

        ethSwapWithdrawTransactionHash: null,
        utxoSwapWithdrawTransactionHash: null,

        refundTransactionHash: null,
        isRefunded: false,

        isFinished: false,
        isSwapExist: false,

        withdrawRequestIncoming: false,
        withdrawRequestAccepted: false,

        isFailedTransaction: false,
        isFailedTransactionError: null,
        gasAmountNeeded: 0,
      }

      this._persistState()

      const flow = this

      if (this.isTaker()) {
        flow.swap.room.on('create utxo script', (data) => {
          const {
            utxoScriptCreatingTransactionHash,
          } = data
          flow.setState({
            utxoScriptCreatingTransactionHash,
          }, true)
        })
        flow.swap.room.on('ethWithdrawTxHash', (data) => {
          const {
            ethSwapWithdrawTransactionHash,
          } = data
          flow.setState({
            ethSwapWithdrawTransactionHash,
          })
        })
      } else {
        flow.swap.room.once('request withdraw', () => {
          flow.setState({
            withdrawRequestIncoming: true,
          })
        })

        flow.swap.room.on('wait btc confirm', () => {
          flow.setState({
            waitBtcConfirm: true,
          })
        })

        flow.swap.room.on('request eth contract', () => {
          const { ethSwapCreationTransactionHash } = flow.state

          if (ethSwapCreationTransactionHash) {
            console.log('Exists - send hash')
            flow.swap.room.sendMessage({
              event: 'create eth contract',
              data: {
                ethSwapCreationTransactionHash,
              },
            })
          }
        })
      }

      super._persistSteps()
    }

    _persistState() {
      super._persistState()
    }

    _getSteps() {
      const flow = this

      if (this.isMaker()) {
        return [

          // 1. Sign swap to start

          () => {
            this.signABSide()
          },

          // 2. Wait participant create, fund BTC Script

          () => {
            flow.waitUTXOScriptCreated()
          },

          // 3. Verify BTC Script

          () => {
            debug('swap.core:flow')(`waiting verify btc script`)
            this.verifyScript()
          },

          // 4. Check balance

          () => {
            this.syncBalance()
          },

          // 5. Create ETH Contract

          async () => {
            const scriptFunded = await this.waitUTXOScriptFunded()
            if (scriptFunded) {
              await flow.ethTokenSwap.fundERC20Contract({
                flow,
              })
            }
          },

          // 6. Wait participant withdraw

          async () => {
            await flow.ethTokenSwap.getSecretFromAB2UTXO({ flow })
          },

          // 7. Withdraw

          async () => {
            await this.btcSwap.withdrawFromSwap({
              flow,
            })
          },

          // 8. Finish

          () => {
            flow.swap.room.once('request swap finished', () => {
              const { utxoSwapWithdrawTransactionHash } = flow.state

              flow.swap.room.sendMessage({
                event: 'swap finished',
                data: {
                  utxoSwapWithdrawTransactionHash,
                },
              })
            })

            flow.finishStep({
              isFinished: true,
            }, { step: 'finish' })
          },

          // 9. Finished!

          () => {},
        ]
      } else {
        return [
          // 1 - `sign` - Signs 
          async () => {
            this.swap.processMetamask()
            this.sign()
          },

          // 2 - `sync-balance` - syncBalance
          async () => {
            this.syncBalance()
          },

          // 3 - `lock-eth` - create AB contract - создание секрета, хеша, отправка хеша
          async () => {
            if (!this.state.secret) {
              const {
                secret,
                secretHash,
              } = this.generateSecret()

              this.createWorkUTXOScript(secretHash, false)

              this.setState({
                secret,
                secretHash,
              }, true)
            }

            await flow.ethTokenSwap.fundERC20Contract({
              flow,
              // Использует принудительно адрес назначения (куда отправить монеты)
              // Это нужно, чтобы тейкер, дождавшись пополнения utxo не снял монеты с ab контракта использу
              // Так-же на стороне UTXO перед пополнением скрипта делаем
              // проверку адреса назначения на ab контракте используя getTargetWallet
              useTargetWallet: true,
            })
          },

          // 4 - `wait-lock-utxo` - wait create UTXO
          async () => {
            await util.helpers.repeatAsyncUntilResult(async () => {
              const isUTXOFunded = await this.waitUTXOScriptFunded()
              if (isUTXOFunded) {
                this.finishStep({}, 'wait-lock-utxo`')
                return true
              }
              return false
            })
          },

          // 5 - `withdraw-utxo` - withdraw from UTXO
          async () => {
            await this.btcSwap.withdrawFromSwap({
              flow,
            })
          },

          // 6 - `finish`
          async () => {
            // @to-do - txids room events
            flow.finishStep({
              isFinished: true,
            }, 'finish')
          },

          // 7 - `end`
          async () => {
            
          },
        ]
      }
    }

    _checkSwapAlreadyExists() {
      const swapData = {
        ownerAddress: this.app.getMyEthAddress(),
        participantAddress: this.app.getParticipantEthAddress(this.swap)
      }

      return this.ethTokenSwap.checkSwapExists(swapData)
    }

    async tryRefund() {
      const { secretHash } = this.state

      const refundHandler = (hash = null) => {
        this.swap.room.sendMessage({
          event: 'eth refund completed',
        })

        this.setState({
          refundTransactionHash: hash,
          isRefunded: true,
          isSwapExist: false,
        }, true)
      }

      try {
        const wasRefunded = await this.ethTokenSwap.wasRefunded({ secretHash })

        if (wasRefunded) {
          debug('swap.core:flow')('This swap was refunded')

          refundHandler()

          return true
        }
      } catch (error) {
        console.warn('wasRefunded error:', error)

        return false
      }

      return this.ethTokenSwap.refund({
        participantAddress: this.app.getParticipantEthAddress(this.swap),
      })
        .then((hash) => {
          if (!hash) {
            return false
          }

          refundHandler(hash)

          return true
        })
        .catch((error) => false)
    }



    async isRefundSuccess() {
      return true
    }

    async tryWithdraw(_secret) {
      const { secret, secretHash, isEthWithdrawn, isbtcWithdrawn, utxoScriptValues } = this.state

      if (!_secret)
        throw new Error(`Withdrawal is automatic. For manual withdrawal, provide a secret`)

      if (!utxoScriptValues)
        throw new Error(`Cannot withdraw without script values`)

      if (secret && secret != _secret)
        console.warn(`Secret already known and is different. Are you sure?`)

      if (isbtcWithdrawn)
        console.warn(`Looks like money were already withdrawn, are you sure?`)

      debug('swap.core:flow')(`WITHDRAW using secret = ${_secret}`)

      const _secretHash = this.app.env.bitcoin.crypto.ripemd160(Buffer.from(_secret, 'hex')).toString('hex')

      if (secretHash != _secretHash)
        console.warn(`Hash does not match! state: ${secretHash}, given: ${_secretHash}`)

      const {scriptAddress} = this.btcSwap.createScript(utxoScriptValues)
      const balance = await this.btcSwap.getBalance(scriptAddress)

      debug('swap.core:flow')(`address=${scriptAddress}, balance=${balance}`)

      if (balance === 0) {
        this.finishStep({
          isbtcWithdrawn: true,
        }, {step: 'withdraw-utxo'})
        throw new Error(`Already withdrawn: address=${scriptAddress},balance=${balance}`)
      }

      this.btcSwap.withdraw({
        scriptValues: utxoScriptValues,
        secret: _secret,
      }).then((hash) => {
        debug('swap.core:flow')(`TX hash=${hash}`)
        this.setState({
          utxoSwapWithdrawTransactionHash: hash,
        })

        debug('swap.core:flow')(`TX withdraw sent: ${this.state.utxoSwapWithdrawTransactionHash}`)

        this.finishStep({
          isbtcWithdrawn: true,
        }, { step: 'withdraw-utxo' })
      })
    }
  }

  return ETHTOKEN2BTC
}
