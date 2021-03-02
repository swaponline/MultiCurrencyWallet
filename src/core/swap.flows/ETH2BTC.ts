import debug from 'debug'
import SwapApp, { constants, util } from 'swap.app'
import { AtomicAB2UTXO } from 'swap.swap'
import { EthSwap, BtcSwap } from 'swap.swaps'


class ETH2BTC extends AtomicAB2UTXO {

  _flowName: string
  ethSwap: EthSwap
  btcSwap: BtcSwap
  state: any

  static getName() {
    return `${this.getFromName()}2${this.getToName()}`
  }
  static getFromName() {
    return constants.COINS.eth
  }
  static getToName() {
    return constants.COINS.btc
  }
  constructor(swap) {
    super(swap)
    this.utxoCoin = `btc`
    this._flowName = ETH2BTC.getName()

    this.isTakerMakerModel = true
    this.setupTakerMakerEvents()
    this.stepNumbers = this.getStepNumbers()

    this.ethSwap = swap.participantSwap
    this.btcSwap = swap.ownerSwap

    this.abBlockchain = this.ethSwap
    this.utxoBlockchain = this.btcSwap

    if (!this.ethSwap) {
      throw new Error('BTC2ETH: "ethSwap" of type object required')
    }
    if (!this.btcSwap) {
      throw new Error('BTC2ETH: "btcSwap" of type object required')
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
      btcSwapWithdrawTransactionHash: null,

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
      console.log('Requesting eth contract')
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
            await flow.ethSwap.fundContract({
              flow,
            })
          }
        },

        // 6. Wait participant withdraw

        async () => {
          await flow.ethSwap.getSecretFromAB2UTXO({ flow })
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
            const { btcSwapWithdrawTransactionHash } = flow.state

            flow.swap.room.sendMessage({
              event: 'swap finished',
              data: {
                btcSwapWithdrawTransactionHash,
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
          console.log('>>>>>> TAKER - ETH2BTC - sign')
          this.swap.processMetamask()
          this.sign()
        },

        // 2 - `sync-balance` - syncBalance
        async () => {
          console.log('>>>>>>> TAKER - ETH2BTC - sync balance')
          this.syncBalance()
        },

        // 3 - `lock-eth` - create AB contract - создание секрета, хеша, отправка хеша
        async () => {
          console.log('>>>>>>>> TAKER - ETH2BTC - lock eth')

          if (!this.state.secret) {
            console.log('>>>>>> CREATE SECRET')
            const {
              secret,
              secretHash,
            } = this.generateSecret()
            console.log('>>>>>', secret, secretHash)
            this.createWorkUTXOScript(secretHash, false)

            this.setState({
              secret,
              secretHash,
            }, true)
          }

          
          console.log('>>>>>> TAKER - ETH2BTC - fund contract eth')

          await flow.ethSwap.fundContract({
            flow,
          })
        },

        // 4 - `wait-lock-utxo` - wait create UTXO
        async () => {
          console.log('>>>> wait lock -utxo')
          this.waitUTXOScriptFunded()
            .then((funded) => {
              console.log('is funded', funded)
              if (funded) {
                this.finishStep({}, 'wait-lock-utxo`')
              }
            })
        },

        // 5 - `withdraw-utxo` - withdraw from UTXO
        async () => {
          console.log('>>>> withdraw-utxo')
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

    return this.ethSwap.checkSwapExists(swapData)
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
      const wasRefunded = await this.ethSwap.wasRefunded({ secretHash })

      if (wasRefunded) {
        debug('swap.core:flow')('This swap was refunded')

        refundHandler()

        return true
      }
    } catch (error) {
      console.warn('wasRefunded error:', error)

      return false
    }

    return this.ethSwap.refund({
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

    const { scriptAddress } = this.btcSwap.createScript(utxoScriptValues)
    const balance = await this.btcSwap.getBalance(scriptAddress)

    debug('swap.core:flow')(`address=${scriptAddress}, balance=${balance}`)

    if (balance === 0) {
      this.finishStep({
        isbtcWithdrawn: true,
      }, { step: 'withdraw-utxo' })
      throw new Error(`Already withdrawn: address=${scriptAddress},balance=${balance}`)
    }

    this.btcSwap.withdraw({
      scriptValues: utxoScriptValues,
      secret: _secret,
    }).then((hash) => {
      debug('swap.core:flow')(`TX hash=${hash}`)
      this.setState({
        btcSwapWithdrawTransactionHash: hash,
      })
    
      debug('swap.core:flow')(`TX withdraw sent: ${this.state.btcSwapWithdrawTransactionHash}`)

      this.finishStep({
        isbtcWithdrawn: true,
      }, { step: 'withdraw-utxo' })
    })
  }
}


export default ETH2BTC
