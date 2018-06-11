import SwapApp from '../swap.app'
import { Flow } from '../swap.swap'


class ETHTOKEN2BTC extends Flow {

  constructor(swap) {
    super(swap)

    this.ethTokenSwap = SwapApp.swaps.ethTokenSwap
    this.btcSwap      = SwapApp.swaps.btcSwap

    if (!this.ethTokenSwap) {
      throw new Error('ETHTOKEN2BTC: "ethTokenSwap" of type object required')
    }
    if (!this.btcSwap) {
      throw new Error('ETHTOKEN2BTC: "btcSwap" of type object required')
    }

    this.state = {
      step: 0,

      signTransactionUrl: null,
      isSignFetching: false,
      isMeSigned: false,

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

      // 1. Sign swap to start

      () => {
        // this.sign()
      },

      // 2. Wait participant create, fund BTC Script

      () => {
        this.swap.room.once('create btc script', ({ scriptValues }) => {
          flow.finishStep({
            secretHash: scriptValues.secretHash,
            btcScriptValues: scriptValues,
          })
        })
      },

      // 3. Verify BTC Script

      () => {
        // this.verifyBtcScript()
      },

      // 4. Check balance

      () => {
        this.syncBalance()
      },

      // 5. Create ETH Contract

      async () => {
        const { participant, sellAmount } = this.swap

        const swapData = {
          participantAddress:   participant.eth.address,
          secretHash:           flow.state.secretHash,
          amount:               sellAmount,
        }

        await this.ethSwap.approve({
          amount: sellAmount,
        })

        await this.ethSwap.create(swapData, (transactionUrl) => {
          this.setState({
            ethSwapCreationTransactionUrl: transactionUrl,
          })
        })

        this.swap.room.sendMessage('create eth contract')

        this.finishStep({
          isEthContractFunded: true,
        })
      },

      // 6. Wait participant withdraw

      () => {
        this.swap.room.once('finish eth withdraw', () => {
          flow.finishStep({
            isEthWithdrawn: true,
          })
        })
      },

      // 7. Withdraw

      async () => {
        const { participant } = this.swap

        const myAndParticipantData = {
          participantAddress: participant.eth.address,
        }

        const secret = await this.ethSwap.getSecret(myAndParticipantData)

        await this.ethSwap.close(myAndParticipantData)

        const { script } = flow.btcSwap.createScript(flow.state.btcScriptValues)

        await flow.btcSwap.withdraw({
          // TODO here is the problem... now in `btcData` stored bitcoinjs-lib instance with additional functionality
          // TODO need to rewrite this - check instances/bitcoin.js and core/swaps/btcSwap.js:185
          btcData: SwapApp.services.auth.accounts.btcData,
          script,
          secret,
        }, (transactionUrl) => {
          flow.setState({
            btcSwapWithdrawTransactionUrl: transactionUrl,
          })
        })

        flow.finishStep({
          isBtcWithdrawn: true,
        })
      },

      // 8. Finish

      () => {

      },
    ]
  }

  async sign() {
    const { participant } = this.swap

    this.setState({
      isSignFetching: true,
    })

    await this.ethSwap.sign(
      {
        participantAddress: participant.eth.address,
      },
      (signTransactionUrl) => {
        this.setState({
          signTransactionUrl,
        })
      }
    )

    this.swap.room.sendMessage('swap sign')

    this.finishStep({
      isMeSigned: true,
    })
  }

  verifyBtcScript() {
    this.finishStep({
      btcScriptVerified: true,
    })
  }

  async syncBalance() {
    const { sellAmount } = this.swap

    this.setState({
      isBalanceFetching: true,
    })

    const balance = await this.ethTokenSwap.fetchBalance(SwapApp.services.auth.accounts.eth.address)
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


export default ETHTOKEN2BTC
