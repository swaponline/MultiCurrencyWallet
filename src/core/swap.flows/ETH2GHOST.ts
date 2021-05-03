import debug from 'debug'
import SwapApp, { constants, util } from 'swap.app'
import { AtomicAB2UTXO } from 'swap.swap'


class ETH2GHOST extends AtomicAB2UTXO {

  _flowName: string
  ethSwap: any
  ghostSwap: any
  state: any

  static getName() {
    return `${this.getFromName()}2${this.getToName()}`
  }
  static getFromName() {
    return constants.COINS.eth
  }
  static getToName() {
    return constants.COINS.ghost
  }
  constructor(swap) {
    super(swap)
    this.utxoCoin = `ghost`
    this._flowName = ETH2GHOST.getName()

    this.stepNumbers = {
      'sign': 1,
      'wait-lock-utxo': 2,
      'verify-script': 3,
      'sync-balance': 4,
      'lock-eth': 5,
      'wait-withdraw-eth': 6, // aka getSecret
      'withdraw-utxo': 7,
      'finish': 8,
      'end': 9
    }

    this.ethSwap = swap.participantSwap
    this.ghostSwap = swap.ownerSwap

    this.abBlockchain = this.ethSwap
    this.utxoBlockchain = this.ghostSwap

    if (!this.ethSwap) {
      throw new Error('ETH2GHOST: "ethSwap" of type object required')
    }
    if (!this.ghostSwap) {
      throw new Error('ETH2GHOST: "ghostSwap" of type object required')
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
      isGhostWithdrawn: false,

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
    }

    this._persistState()

    const flow = this
    flow.swap.room.once('request withdraw', () => {
      flow.setState({
        withdrawRequestIncoming: true,
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

  //@ts-ignore: strictNullChecks
  _getSteps() {
    const flow = this

    return [

      // 1. Sign swap to start

      () => {
        this.signABSide()
      },

      // 2. Wait participant create, fund BTC Script

      () => {
        flow.waitUTXOScriptCreated()
      },

      // 3. Verify GHOST Script

      () => {
        debug('swap.core:flow')(`waiting verify ghost script`)
        this.verifyScript()
      },

      // 4. Check balance

      () => {
        this.syncBalance()
      },

      // 5. Create ETH Contract

      async () => {
        await flow.ethSwap.fundAB2UTXOContract({
          flow,
          utxoCoin: `ghost`,
        })
      },

      // 6. Wait participant withdraw

      async () => {
        await flow.ethSwap.getSecretFromAB2UTXO({ flow })
      },

      // 7. Withdraw

      async () => {
        await util.helpers.repeatAsyncUntilResult((stopRepeat) => {
          const { secret, utxoScriptValues, utxoSwapWithdrawTransactionHash } = flow.state

          if (utxoSwapWithdrawTransactionHash) {
            return true
          }

          if (!utxoScriptValues) {
            console.error('There is no "utxoScriptValues" in state. No way to continue swap...')
            return null
          }

          return flow.ghostSwap.withdraw({
            scriptValues: utxoScriptValues,
            secret,
            destinationAddress: flow.swap.destinationBuyAddress,
          })
            .then((hash) => {
              console.log('withdraw hash', hash)
              flow.setState({
                utxoSwapWithdrawTransactionHash: hash,
              }, true)
              return true
            })
            .catch((error) => null)
        })

        flow.finishStep({
          isGhostWithdrawn: true,
        }, { step: 'withdraw-utxo' })
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
    const { secret, secretHash, isEthWithdrawn, isGhostWithdrawn, utxoScriptValues } = this.state

    if (!_secret)
      throw new Error(`Withdrawal is automatic. For manual withdrawal, provide a secret`)

    if (!utxoScriptValues)
      throw new Error(`Cannot withdraw without script values`)

    if (secret && secret != _secret)
      console.warn(`Secret already known and is different. Are you sure?`)

    if (isGhostWithdrawn)
      console.warn(`Looks like money were already withdrawn, are you sure?`)

    debug('swap.core:flow')(`WITHDRAW using secret = ${_secret}`)

    const _secretHash = this.app.env.bitcoin.crypto.ripemd160(Buffer.from(_secret, 'hex')).toString('hex')

    if (secretHash != _secretHash)
      console.warn(`Hash does not match! state: ${secretHash}, given: ${_secretHash}`)

    const { scriptAddress } = this.ghostSwap.createScript(utxoScriptValues)
    const balance = await this.ghostSwap.getBalance(scriptAddress)

    debug('swap.core:flow')(`address=${scriptAddress}, balance=${balance}`)

    if (balance === 0) {
      this.finishStep({
        isGhostWithdrawn: true,
      }, { step: 'withdraw-utxo' })
      throw new Error(`Already withdrawn: address=${scriptAddress},balance=${balance}`)
    }

    await this.ghostSwap.withdraw({
      scriptValues: utxoScriptValues,
      secret: _secret,
    }, (hash) => {
      debug('swap.core:flow')(`TX hash=${hash}`)
      this.setState({
        utxoSwapWithdrawTransactionHash: hash,
      })
    })
    debug('swap.core:flow')(`TX withdraw sent: ${this.state.utxoSwapWithdrawTransactionHash}`)

    this.finishStep({
      isGhostWithdrawn: true,
    }, { step: 'withdraw-utxo' })
  }
}


export default ETH2GHOST
