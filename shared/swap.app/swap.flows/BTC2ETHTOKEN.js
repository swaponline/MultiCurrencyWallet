import crypto from 'bitcoinjs-lib/src/crypto'
import { Flow } from '../swap.swap'
import SwapApp from '../swap.app'


class BTC2ETHTOKEN extends Flow {

  constructor(swap) {
    super(swap)

    this.ethTokenSwap = SwapApp.swaps.ethTokenSwap
    this.btcSwap      = SwapApp.swaps.btcSwap

    if (!this.ethTokenSwap) {
      throw new Error('BTC2ETH failed. "ethTokenSwap" of type object required')
    }
    if (!this.btcSwap) {
      throw new Error('BTC2ETH failed. "btcSwap" of type object required')
    }

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
          btcOwnerPublicKey:  SwapApp.services.auth.accounts.btc.publicKey,
          ethOwnerPublicKey:  participant.btc.publicKey,
        })

        await this.btcSwap.fundScript({
          myKeyPair:  SwapApp.services.auth.accounts.btc,
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

    const balance = await this.btcSwap.fetchBalance(SwapApp.services.auth.accounts.btc.getAddress())
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


export default BTC2ETHTOKEN
