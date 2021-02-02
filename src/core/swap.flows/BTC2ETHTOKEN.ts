import debug from 'debug'
import SwapApp, { constants, util } from 'swap.app'
import { Flow } from 'swap.swap'
import { BigNumber } from 'bignumber.js'


export default (tokenName) => {

  class BTC2ETHTOKEN extends Flow {

    _flowName: string
    ethTokenSwap: any
    btcSwap: any
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

      this._flowName = BTC2ETHTOKEN.getName()

      this.stepNumbers = {
        'sign': 1,
        'submit-secret': 2,
        'sync-balance': 3,
        'lock-btc': 4,
        'wait-lock-eth': 5,
        'withdraw-eth': 6,
        'finish': 7,
        'end': 8
      }

      this.ethTokenSwap = swap.ownerSwap
      this.btcSwap      = swap.participantSwap

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

        btcScriptCreatingTransactionHash: null,
        ethSwapCreationTransactionHash: null,

        secretHash: null,

        btcScriptVerified: false,

        isBalanceFetching: false,
        isBalanceEnough: true,
        balance: null,

        isEthContractFunded: false,

        btcSwapWithdrawTransactionHash: null,
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

      return [

        // 1. Signs

        async () => {
          flow.swap.processMetamask()
          flow.swap.room.once('swap sign', () => {
            const { step } = flow.state

            if (step >= 2) {
              return
            }

            flow.swap.room.once('eth refund completed', () => {
              flow.tryRefund()
            })

            flow.finishStep({
              isParticipantSigned: true,
            }, { step: 'sign', silentError: true })
          })

          flow.swap.room.once('swap exists', () => {
            flow.setState({
              isSwapExist: true,
            })

            flow.stopSwapProcess()
          })

          flow.swap.room.sendMessage({
            event: 'request sign',
          })
        },

        // 2. Create secret, secret hash and BTC script

        () => {
          // this.submitSecret()
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
          await flow.ethTokenSwap.withdrawFromAB2UTXO({ flow })
        },

        // 7. Finish

        () => {
          flow.swap.room.once('swap finished', ({btcSwapWithdrawTransactionHash}) => {
            flow.setState({
              btcSwapWithdrawTransactionHash,
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
    }

    /**
     * TODO - backport version compatibility
     *  mapped to sendWithdrawRequestToAnotherParticipant
     *  remove at next iteration after client software update
     *  Used in swap.react
     */
    sendWithdrawRequest() {
      return this.sendWithdrawRequestToAnotherParticipant()
    }

    getScriptCreateTx() {
      const {
        btcScriptCreatingTransactionHash: createTx,
      } = this.state
      return createTx
    }

    sendWithdrawRequestToAnotherParticipant() {
      const flow = this

      const { requireWithdrawFee, requireWithdrawFeeSended } = flow.state

      if (!requireWithdrawFee || requireWithdrawFeeSended) {
        return
      }

      flow.setState({
        requireWithdrawFeeSended: true,
      })

      flow.swap.room.on('accept withdraw request', () => {
        flow.swap.room.sendMessage({
          event: 'do withdraw',
          data: {
            secret: flow.state.secret,
          }
        })
      })

      flow.swap.room.sendMessage({
        event: 'request withdraw',
      })
    }

    submitSecret(secret) {
      if (this.state.secretHash) { return }

      if (!this.state.isParticipantSigned) {
        throw new Error(`Cannot proceed: participant not signed. step=${this.state.step}`)
      }

      const secretHash = this.app.env.bitcoin.crypto.ripemd160(Buffer.from(secret, 'hex')).toString('hex')

      /* Secret hash generated - create BTC script - and only after this notify other part */
      this.createWorkBTCScript(secretHash);

      const _secret = `0x${secret.replace(/^0x/, '')}`

      this.finishStep({
        secret: _secret,
        secretHash,
      }, { step: 'submit-secret' })
    }

    getBTCScriptAddress() {
      const { scriptAddress } = this.state
      return scriptAddress;
    }

    createWorkBTCScript(secretHash) {
      if (this.state.utxoScriptValues) {
        debug('swap.core:flow')('BTC Script already generated', this.state.btcScriptValues);
        return;
      }
      const { participant } = this.swap

      const utcNow = () => Math.floor(Date.now() / 1000)
      const getLockTime = () => utcNow() + 60 * 60 * 3 // 3 hours from now

      const scriptValues = {
        secretHash: secretHash,
        ownerPublicKey: this.app.services.auth.accounts.btc.getPublicKey(),
        recipientPublicKey: participant.btc.publicKey,
        lockTime: getLockTime(),
      }
      const { scriptAddress } = this.btcSwap.createScript(scriptValues)

      this.setState({
        scriptAddress: scriptAddress,
        utxoScriptValues: scriptValues,
      });
    }

    async skipSyncBalance() {
      this.finishStep({}, { step: 'sync-balance' })
    }

    async syncBalance() {
      const { sellAmount } = this.swap

      this.setState({
        isBalanceFetching: true,
      })

      const btcAddress = this.app.services.auth.accounts.btc.getAddress()

      const txFee = await this.btcSwap.estimateFeeValue({ method: 'swap', fixed: true, address: btcAddress })
      const unspents = await this.btcSwap.fetchUnspents(btcAddress)
      const totalUnspent = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
      const balance = new BigNumber(totalUnspent).dividedBy(1e8)

      const needAmount = sellAmount.plus(txFee)
      const isEnoughMoney = needAmount.isLessThanOrEqualTo(balance)

      const stateData = {
        balance,
        isBalanceFetching: false,
        isBalanceEnough: isEnoughMoney,
      }

      if (isEnoughMoney) {
        this.finishStep(stateData, { step: 'sync-balance' })
      } else {
        this.setState(stateData, true)
      }
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
            event: 'btc refund completed',
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

    stopSwapProcess() {
      const flow = this

      console.warn('Swap was stoped')

      flow.setState({
        isStoppedSwap: true,
      }, true)
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

      const { participant } = this.swap

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
