import crypto from 'bitcoinjs-lib/src/crypto'
import SwapApp from '../swap.app'
import { Flow } from '../swap.swap'


class BTC2ETH extends Flow {

  constructor(swap) {
    super(swap)

    this.ethSwap = SwapApp.swaps.ethSwap
    this.btcSwap = SwapApp.swaps.btcSwap

    if (!this.ethSwap) {
      throw new Error('BTC2ETH: "ethSwap" of type object required')
    }
    if (!this.btcSwap) {
      throw new Error('BTC2ETH: "btcSwap" of type object required')
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
        flow.swap.room.once('swap sign', () => {
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
        const { sellAmount, participant } = flow.swap

        const { script: btcScript, ...scriptValues } = flow.btcSwap.createScript({
          secretHash:         flow.state.secretHash,
          btcOwnerPublicKey:  SwapApp.services.auth.accounts.btc.getPublicKey(),
          ethOwnerPublicKey:  participant.btc.publicKey,
        })

        await flow.btcSwap.fundScript({
          script: btcScript,
          amount: sellAmount,
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
        flow.swap.room.once('create eth contract', ({ ethSwapCreationTransactionUrl }) => {
          flow.finishStep({
            isEthContractFunded: true,
            ethSwapCreationTransactionUrl,
          })
        })
      },

      // 6. Withdraw

      async () => {
        const { participant } = flow.swap
      
        const data = {
          ownerAddress:   participant.eth.address,
          secret:         flow.state.secret,
        }

        await flow.ethSwap.withdraw(data, (transactionHash) => {
          flow.setState({
            ethSwapWithdrawTransactionUrl: transactionHash,
          })
        })

        flow.swap.room.sendMessage('finish eth withdraw')

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


export default BTC2ETH
