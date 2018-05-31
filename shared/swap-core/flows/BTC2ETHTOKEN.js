import crypto from 'bitcoinjs-lib/src/crypto'
import Flow from '../Flow'
import { storage } from '../Storage'


class BTC2ETH extends Flow {

  constructor({ swap, data, options: { ethSwap, btcSwap, fetchBalance } }) {
    super({ swap })

    if (!ethSwap) {
      throw new Error('BTC2ETH failed. "ethSwap" of type object required.')
    }
    if (!btcSwap) {
      throw new Error('BTC2ETH failed. "btcSwap" of type object required.')
    }
    if (typeof fetchBalance !== 'function') {
      throw new Error('BTC2ETH failed. "fetchBalance" of type function required.')
    }

    this.ethSwap        = ethSwap
    this.btcSwap        = btcSwap
    this.fetchBalance   = fetchBalance

    this.state = {
      step: 0,

      signTransactionUrl: null,
      isSignFetching: false,
      isParticipantSigned: false,

      secretHash: null,
      btcScriptValues: null,

      btcScriptVerified: false,

      isBalanceFetching: false,
      isBalanceEnough: false,
      balance: null,

      ethSwapCreationTransactionUrl: null,
      isEthContractFunded: false,

      isEthWithdrawn: false,
      isBtcWithdrawn: false,
    }

    super._persistSteps()
    this._persistState()
  }

  _persistState() {
    super._persistState()
  }

  _getSteps() {
    const flow = this

    return [

      // 1. Signs

      () => {
        this.swap.room.once('swap sign', () => {
          flow.finishStep({
            isParticipantSigned: true,
          })
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

      // 4. Create BTC Script, fund, notify participant

      async () => {
        const { sellAmount, participant } = this.swap

        const { script: btcScript, ...scriptValues } = this.btcSwap.createScript({
          secretHash:         flow.state.secretHash,
          btcOwnerPublicKey:  storage.me.btc.publicKey,
          ethOwnerPublicKey:  participant.btc.publicKey,
        })

        await this.btcSwap.fundScript({
          myAddress:  storage.me.btc.address,
          myKeyPair:  storage.me.btc,
          script:     btcScript,
          amount:     sellAmount,
        })

        this.swap.room.sendMessage('create btc script', {
          scriptValues,
        })

        flow.finishStep({
          isBtcScriptFunded: true,
          btcScriptValues: scriptValues,
        })
      },

      // 5. Wait participant creates ETH Contract

      () => {
        this.swap.room.once('create eth contract', () => {
          flow.finishStep({
            isEthContractFunded: true,
          })
        })
      },

      // 6. Withdraw

      async () => {
        const { participant } = this.swap

        const data = {
          myAddress:      storage.me.eth.address,
          ownerAddress:   participant.eth.address,
          secret:         flow.state.secret,
        }

        await this.ethSwap.withdraw(data, (transactionHash) => {
          flow.setState({
            ethSwapWithdrawTransactionUrl: transactionHash,
          })
        })

        this.swap.room.sendMessage('finish eth withdraw')

        flow.finishStep({
          isEthWithdrawn: true,
        })
      },

      // 7. Finish

      () => {

      },
    ]
  }

  submitSecret(secret) {
    const secretHash = crypto.ripemd160(Buffer.from(secret, 'hex')).toString('hex')

    this.finishStep({
      secret,
      secretHash,
    })
  }

  async syncBalance() {
    const { sellAmount } = this.swap

    this.setState({
      isBalanceFetching: true,
    })

    const balance = await this.fetchBalance()
    const isEnoughMoney = sellAmount <= balance

    if (isEnoughMoney) {
      this.finishStep({
        balance,
        isBalanceFetching: false,
        isBalanceEnough: true,
      })
    }
    else {
      this.setState({
        balance,
        isBalanceFetching: false,
        isBalanceEnough: false,
      })
    }
  }
}


export default BTC2ETH
