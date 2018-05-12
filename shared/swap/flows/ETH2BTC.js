import Flow from '../Flow'
import room from '../room'
import { storage } from '../Storage'


class ETH2BTC extends Flow {

  constructor({ swap, data, options: { ethSwap, btcSwap, getBalance } }) {
    super({ swap })

    if (!ethSwap) {
      throw new Error('ETH2BTC failed. "ethSwap" of type object required.')
    }
    if (!btcSwap) {
      throw new Error('ETH2BTC failed. "btcSwap" of type object required.')
    }
    if (typeof getBalance !== 'function') {
      throw new Error('ETH2BTC failed. "getBalance" of type function required.')
    }

    this.ethSwap    = ethSwap
    this.btcSwap    = btcSwap
    this.getBalance = getBalance

    this.state = {
      step: 0,

      signTransactionUrl: null,
      isSignFetching: false,
      isMeSigned: false,
      isParticipantSigned: false,

      secretHash: null,
      btcScriptValues: null,

      btcScriptVerified: false,

      isBalanceFetching: false,
      isBalanceEnough: false,

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
    const { id } = this.swap
    const flow = this

    return [

      // 1. Signs

      () => {
        const { id } = this.swap

        room.subscribe('swap sign', function ({ orderId }) {
          if (id === orderId) {
            this.unsubscribe()

            flow.finishStep({
              isParticipantSigned: true,
            })

            const { isMeSigned, isParticipantSigned } = flow.state

            if (isMeSigned && isParticipantSigned) {
              flow.finishStep()
            }
          }
        })
      },

      // 2. Wait participant create, fund BTC Script

      () => {
        room.subscribe('create btc script', function ({ orderId, scriptValues }) {
          if (id === orderId) {
            this.unsubscribe()

            flow.finishStep({
              secretHash: scriptValues.secretHash,
              btcScriptValues: scriptValues,
            })
          }
        })
      },

      // 3. Verify BTC Script

      () => {
        this.finishStep({
          btcScriptVerified: true,
        })
      },

      // 4. Check balance

      () => {
        this.syncBalance()
      },

      // 5. Create ETH Contract

      async () => {
        const { participant, sellAmount } = this.swap

        const swapData = {
          myAddress:            storage.me.eth.address,
          participantAddress:   participant.eth.address,
          secretHash:           flow.state.secretHash,
          amount:               sellAmount,
        }

        await this.ethSwap.create(swapData, (transactionUrl) => {
          this.setState({
            ethSwapCreationTransactionUrl: transactionUrl,
          })
        })

        room.sendMessage(participant.peer, [
          {
            event: 'create eth contract',
            data: {
              orderId: storage.id,
            },
          },
        ])

        this.finishStep({
          isEthContractFunded: true,
        })
      },

      // 6. Wait participant withdraw

      () => {
        room.subscribe('finish eth withdraw', function ({ orderId }) {
          if (storage.id === orderId) {
            this.unsubscribe()

            flow.finishStep({
              isEthWithdrawn: true,
            })
          }
        })
      },

      // 7. Withdraw

      async () => {
        const { participant } = this.swap

        const myAndParticipantData = {
          myAddress: storage.me.eth.address,
          participantAddress: participant.eth.address,
        }

        const secret = await this.ethSwap.getSecret(myAndParticipantData)

        await flow.ethSwap.close(myAndParticipantData)

        const { script } = flow.btcSwap.createScript(flow.state.btcScriptValues)

        await flow.btcSwap.withdraw({
          // TODO here is the problem... now in `btcData` stored bitcoinjs-lib instance with additional functionality
          // TODO need to rewrite this - check instances/bitcoin.js and core/swaps/btcSwap.js:185
          btcData: storage.me.btcData,
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
    const { id, participant } = this.swap

    this.setState({
      isSignFetching: true,
    })

    await this.ethSwap.sign(
      {
        myAddress: storage.me.eth.address,
        participantAddress: participant.eth.address,
      },
      (signTransactionUrl) => {
        this.setState({
          signTransactionUrl,
        })
      }
    )

    this.setState({
      isSignFetching: false,
      isMeSigned: true,
    })

    room.sendMessage(participant.peer, [
      {
        event: 'swap:signed',
        data: {
          orderId: id,
        },
      },
    ])

    const { isMeSigned, isParticipantSigned } = this.state

    if (isMeSigned && isParticipantSigned) {
      this.finishStep()
    }
  }

  async syncBalance() {
    const { sellAmount } = this.swap

    this.setState({
      isBalanceFetching: true,
    })

    const balance = await this.getBalance()
    const isEnoughMoney = sellAmount <= balance

    if (isEnoughMoney) {
      this.finishStep({
        isBalanceFetching: false,
        isBalanceEnough: true,
      })
    }
    else {
      this.setState({
        isBalanceFetching: false,
        isBalanceEnough: false,
      })
    }
  }
}


export default ETH2BTC
