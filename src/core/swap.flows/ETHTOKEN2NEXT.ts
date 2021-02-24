import debug from 'debug'
import SwapApp, { constants, util } from 'swap.app'
import { AtomicAB2UTXO } from 'swap.swap'


export default (tokenName) => {

  class ETHTOKEN2NEXT extends AtomicAB2UTXO {

    _flowName: string
    ethTokenSwap: any
    nextSwap: any
    state: any

    static getName() {
      return `${this.getFromName()}2${this.getToName()}`
    }
    static getFromName() {
      return tokenName.toUpperCase()
    }
    static getToName() {
      return constants.COINS.next
    }
    constructor(swap) {
      super(swap)
      this.utxoCoin = `next`

      this._flowName = ETHTOKEN2NEXT.getName()

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

      this.ethTokenSwap = swap.participantSwap
      this.nextSwap = swap.ownerSwap

      this.abBlockchain = this.ethTokenSwap
      this.utxoBlockchain = this.nextSwap

      if (!this.ethTokenSwap) {
        throw new Error('ETHTOKEN2NEXT: "ethTokenSwap" of type object required')
      }
      if (!this.nextSwap) {
        throw new Error('ETHTOKEN2NEXT: "nextSwap" of type object required')
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
        isNextWithdrawn: false,

        ethSwapWithdrawTransactionHash: null,
        nextSwapWithdrawTransactionHash: null,

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
      flow.swap.room.once('request withdraw', () => {
        flow.setState({
          withdrawRequestIncoming: true,
        })
      })

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
          this.signABSide()
        },

        // 2. Wait participant create, fund NEXT Script

        () => {
          flow.waitUTXOScriptCreated()
        },

        // 3. Verify NEXT Script

        () => {
          debug('swap.core:flow')(`waiting verify next script`)
          this.verifyScript()
        },

        // 4. Check balance

        () => {
          this.syncBalance()
        },

        // 5. Create ETH Contract

        async () => {
          await flow.ethTokenSwap.fundAB2UTXOContract({
            flow,
            utxoCoin: `next`,
          })
        },

        // 6. Wait participant withdraw

        async () => {
          await flow.ethTokenSwap.getSecretFromAB2UTXO({ flow })
        },

        // 7. Withdraw

        async () => {
          await util.helpers.repeatAsyncUntilResult((stopRepeat) => {
            const { secret, utxoScriptValues, nextSwapWithdrawTransactionHash } = flow.state

            if (nextSwapWithdrawTransactionHash) {
              return true
            }

            if (!utxoScriptValues) {
              console.error('There is no "utxoScriptValues" in state. No way to continue swap...')
              return null
            }

            return flow.nextSwap.withdraw({
              scriptValues: utxoScriptValues,
              secret,
              destinationAddress: flow.swap.destinationBuyAddress,
            })
              .then((hash) => {
                flow.setState({
                  nextSwapWithdrawTransactionHash: hash,
                }, true)
                return true
              })
              .catch((error) => null)
          })

          flow.finishStep({
            isNextWithdrawn: true,
          }, { step: 'withdraw-utxo' })
        },

        // 8. Finish

        () => {
          flow.swap.room.once('request swap finished', () => {
            const { nextSwapWithdrawTransactionHash } = flow.state

            flow.swap.room.sendMessage({
              event: 'swap finished',
              data: {
                nextSwapWithdrawTransactionHash,
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
      const { secret, secretHash, isEthWithdrawn, isNextWithdrawn, utxoScriptValues } = this.state

      if (!_secret)
        throw new Error(`Withdrawal is automatic. For manual withdrawal, provide a secret`)

      if (!utxoScriptValues)
        throw new Error(`Cannot withdraw without script values`)

      if (secret && secret != _secret)
        console.warn(`Secret already known and is different. Are you sure?`)

      if (isNextWithdrawn)
        console.warn(`Looks like money were already withdrawn, are you sure?`)

      debug('swap.core:flow')(`WITHDRAW using secret = ${_secret}`)

      const _secretHash = this.app.env.bitcoin.crypto.ripemd160(Buffer.from(_secret, 'hex')).toString('hex')

      if (secretHash != _secretHash)
        console.warn(`Hash does not match! state: ${secretHash}, given: ${_secretHash}`)

      const {scriptAddress} = this.nextSwap.createScript(utxoScriptValues)
      const balance = await this.nextSwap.getBalance(scriptAddress)

      debug('swap.core:flow')(`address=${scriptAddress}, balance=${balance}`)

      if (balance === 0) {
        this.finishStep({
          isNextWithdrawn: true,
        }, {step: 'withdraw-utxo'})
        throw new Error(`Already withdrawn: address=${scriptAddress},balance=${balance}`)
      }

      await this.nextSwap.withdraw({
        scriptValues: utxoScriptValues,
        secret: _secret,
      }, (hash) => {
        debug('swap.core:flow')(`TX hash=${hash}`)
        this.setState({
          nextSwapWithdrawTransactionHash: hash,
        })
      })
      debug('swap.core:flow')(`TX withdraw sent: ${this.state.nextSwapWithdrawTransactionHash}`)

      this.finishStep({
        isNextWithdrawn: true,
      }, { step: 'withdraw-utxo' })
    }
  }

  return ETHTOKEN2NEXT
}
