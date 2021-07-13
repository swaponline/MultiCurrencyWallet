import debug from 'debug'
import { util } from 'swap.app'
import { AtomicAB2UTXO } from 'swap.swap'
import { EthLikeSwap, NextSwap } from 'swap.swaps'


interface IEvmToNext {
  flowName: string
  getMyAddress: Function
  getParticipantAddress: Function
}
class EvmToNext extends AtomicAB2UTXO {

  _flowName: string
  evmCoin: string

  evmSwap: EthLikeSwap
  utxoSwap: NextSwap

  ethLikeSwap: EthLikeSwap

  state: any

  getMyAddress: Function
  getParticipantAddress: Function

  constructor(swap, options: IEvmToNext) {
    super(swap)

    if (!options.flowName) {
      throw new Error('EvmToNext - option flowName requery')
    }
    if (!options.getMyAddress || typeof options.getMyAddress !== 'function') {
      throw new Error(`EvmToNext ${options.flowName} - option getMyAddress - function requery`)
    }
    if (!options.getParticipantAddress || typeof options.getParticipantAddress !== 'function') {
      throw new Error(`EvmToNext ${options.flowName} - option getParticipantAddress - function requery`)
    }

    this.getMyAddress = options.getMyAddress
    this.getParticipantAddress = options.getParticipantAddress

    this.utxoCoin = `next`
    this.evmCoin = swap.ethLikeCoin
    this._flowName = options.flowName

    this.isTakerMakerModel = true
    this.setupTakerMakerEvents()
    this.stepNumbers = this.getStepNumbers()

    this.evmSwap = swap.participantSwap
    this.utxoSwap = swap.ownerSwap

    // need for another classes
    this.ethLikeSwap = this.evmSwap
    this.abBlockchain = this.evmSwap
    this.utxoBlockchain = this.utxoSwap

    if (!this.evmSwap) {
      throw new Error(`${this._flowName}: "evmSwap" of type object required`)
    }
    if (!this.utxoSwap) {
      throw new Error(`${this._flowName}: "utxoSwap" of type object required`)
    }

    // ToDo: update state to UTXO and EVM names
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

      ethLikeSwapCreationTransactionHash: null,
      canCreateEthTransaction: true,
      isEthContractFunded: false,

      secret: null,

      isEthWithdrawn: false,
      isbtcWithdrawn: false,

      ethLikeSwapWithdrawTransactionHash: null,
      utxoSwapWithdrawTransactionHash: null,

      refundTransactionHash: null,
      isRefunded: false,

      isFinished: false,
      isSwapExist: false,

      withdrawRequestIncoming: false,
      withdrawRequestAccepted: false,

      isFailedTransaction: false,
      isFailedTransactionError: null,
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
          ethLikeSwapWithdrawTransactionHash,
        } = data
        flow.setState({
          ethLikeSwapWithdrawTransactionHash,
        })
      })
    } else {
      flow.swap.room.once('request withdraw', () => {
        flow.setState({
          withdrawRequestIncoming: true,
        })
      })

      flow.swap.room.on('request eth contract', () => {
        const { ethLikeSwapCreationTransactionHash } = flow.state

        if (ethLikeSwapCreationTransactionHash) {
          console.log('Exists - send hash')
          flow.swap.room.sendMessage({
            event: 'create eth contract',
            data: {
              ethLikeSwapCreationTransactionHash,
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

  //@ts-ignore: strictNullChecks
  _getSteps() {
    const flow = this

    if (this.isMaker()) {
      return [

        // 1. Sign swap to start

        () => {
          this.signABSide()
        },

        // 2. Wait participant create and fund UTXO Script

        () => {
          flow.waitUTXOScriptCreated()
        },

        // 3. Verify UTXO Script

        () => {
          debug('swap.core:flow')(`waiting verify utxo script`)
          this.verifyScript()
        },

        // 4. Check balance

        () => {
          this.syncBalance()
        },

        // 5. Create EVM Contract

        async () => {
          const scriptFunded = await this.waitUTXOScriptFunded()
          if (scriptFunded) {
            await flow.evmSwap.fundContract({
              flow,
            })
          }
        },

        // 6. Wait participant withdraw

        async () => {
          const {
            secretHash,
          } = this.state

          await util.helpers.repeatAsyncUntilResult(async () => {
            const isSwapCreated = await flow.evmSwap.isSwapCreated({
              ownerAddress: flow.getMyAddress(),
              participantAddress: flow.getParticipantAddress(flow.swap),
              secretHash,
            })

            if (isSwapCreated) {
              await flow.evmSwap.getSecretFromContract({ flow })
              return true
            }
            return false
          })
        },

        // 7. Withdraw

        async () => {
          await this.utxoSwap.withdrawFromSwap({
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

        () => {}
      ]
    } else {
      return [
        // 1 - `sign` - Signs
        async () => {
          this.signABSide()
        },

        // 2 - `sync-balance` - syncBalance
        async () => {
          this.syncBalance()
        },

        // 3 - `lock-eth` - create secret and secretHash - create EVM contract
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

          await flow.evmSwap.fundContract({
            flow,
            // Использует принудительно адрес назначения (куда отправить монеты)
            // Это нужно, чтобы тейкер, дождавшись пополнения utxo не снял монеты с evm контракта использу
            // Так-же на стороне UTXO перед пополнением скрипта делаем
            // проверку адреса назначения на evm контракте используя getTargetWallet
            useTargetWallet: true,
          })
        },

        // 4 - `wait-lock-utxo` - wait when UTXO script created and funded
        async () => {
          this.waitUTXOScriptFunded()
            .then((funded) => {
              if (funded) {
                this.finishStep({}, 'wait-lock-utxo`')
              }
            })
        },

        // 5 - `withdraw-utxo` - withdraw from UTXO
        async () => {
          await this.utxoSwap.withdrawFromSwap({
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
        async () => {},
      ]
    }
  }

  _checkSwapAlreadyExists() {
    const swapData = {
      ownerAddress: this.getMyAddress(),
      participantAddress: this.getParticipantAddress(this.swap)
    }

    return this.evmSwap.checkSwapExists(swapData)
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
      const wasRefunded = await this.evmSwap.wasRefunded({ secretHash })

      if (wasRefunded) {
        debug('swap.core:flow')('This swap was refunded')

        refundHandler()

        return true
      }
    } catch (error) {
      console.warn('wasRefunded error:', error)

      return false
    }

    return this.evmSwap.refund({
      participantAddress: this.getParticipantAddress(this.swap),
    })
      .then((hash) => {
        if (!hash) {
          return false
        }

        //@ts-ignore: strictNullChecks
        refundHandler(hash)

        return true
      })
      .catch((error) => false)
  }

  async isRefundSuccess() {
    return true
  }

  async tryWithdraw(_secret) {
    const { secret, secretHash, isbtcWithdrawn, utxoScriptValues } = this.state

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

    const { scriptAddress } = this.utxoSwap.createScript(utxoScriptValues)
    const balance = await this.utxoSwap.getBalance(scriptAddress)

    debug('swap.core:flow')(`address=${scriptAddress}, balance=${balance}`)

    if (balance === 0) {
      this.finishStep({
        isbtcWithdrawn: true,
      }, { step: 'withdraw-utxo' })
      throw new Error(`Already withdrawn: address=${scriptAddress},balance=${balance}`)
    }

    this.utxoSwap.withdraw({
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


export default EvmToNext
