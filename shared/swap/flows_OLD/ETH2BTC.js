import Flow from '../Flow'
import room from '../room'
import { storage } from '../Storage'


class ETH2BTC extends Flow {

  /*

    Flow storage data:

    {string}    signTransactionUrl
    {boolean}   isSignFetching
    {boolean}   isMeSigned
    {boolean}   isParticipantSigned

    {boolean}   secretHash
    {boolean}   isBalanceFetching
    {boolean}   isBalanceEnough
    {object}    btcScriptData
    {boolean}   btcScriptVerified
    {string}    ethSwapCreationTransactionUrl
    {boolean}   isEthContractFunded
    {boolean}   isEthWithdrawn
    {string}    btcSwapWithdrawTransactionUrl
    {boolean}   isWithdrawn

   */

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

    this._persistState()
  }

  _getSteps() {
    const { id } = this.swap
    const flow = this

    return [

      // Wait participant create BTC Script

      () => {
        room.subscribe('create btc script', function ({ orderId, secretHash, btcScriptData }) {
          if (id === orderId) {
            this.unsubscribe()

            flow.finishStep({
              secretHash,
              btcScriptData,
            })
          }
        })
      },

      // Verify BTC Script

      () => {
        this.finishStep({
          btcScriptVerified: true,
        })
      },

      // Check balance

      () => {
        this.syncBalance()
      },

      // Create ETH Contract

      async () => {
        const { participant, sellAmount } = this.swap

        const swapData = {
          myAddress:            storage.me.eth.address,
          participantAddress:   participant.eth.address,
          secretHash:           flow.storage.secretHash,
          amount:               sellAmount,
        }

        await this.ethSwap.create(swapData, (transactionUrl) => {
          this.storage.update({
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

      // Wait participant withdraw

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

      // Withdraw

      async () => {
        const { participant } = this.swap

        const myAndParticipantData = {
          myAddress: storage.me.eth.address,
          participantAddress: participant.eth.address,
        }

        const secret = await this.ethSwap.getSecret(myAndParticipantData)

        await flow.ethSwap.close(myAndParticipantData)

        const { script } = flow.btcSwap.createScript(flow.storage.btcScriptData)

        await flow.btcSwap.withdraw({
          // TODO here is the problem... now in `btcData` stored bitcoinjs-lib instance with additional functionality
          // TODO need to rewrite this - check instances/bitcoin.js and core/swaps/btcSwap.js:185
          btcData: storage.me.btcData,
          script,
          secret,
        }, (transactionUrl) => {
          flow.storage.update({
            btcSwapWithdrawTransactionUrl: transactionUrl,
          })
        })

        flow.finishStep({
          isWithdrawn: true,
        })
      },

      // Finish

      () => {

      },
    ]
  }

  async sign() {
    const { id, participant } = this.swap

    this.storage.update({
      isSignFetching: true,
    })

    await this.ethSwap.sign(
      {
        myAddress: storage.me.eth.address,
        participantAddress: participant.eth.address,
      },
      (signTransactionUrl) => {
        this.storage.update({
          signTransactionUrl,
        })
      }
    )

    this.storage.update({
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

    const { isMeSigned, isParticipantSigned } = this.storage

    if (isMeSigned && isParticipantSigned) {
      this.finishStep()
    }
  }

  async syncBalance() {
    const { storage } = this.swap

    this.storage.update({
      isBalanceFetching: true,
    })

    const balance = await this.getBalance()
    const isEnoughMoney = storage.requiredAmount <= balance

    if (isEnoughMoney) {
      this.finishStep({
        isBalanceFetching: false,
        isBalanceEnough: false,
      })
    }
    else {
      this.storage.update({
        isBalanceFetching: false,
        isBalanceEnough: true,
      })
    }
  }
}


export default ETH2BTC
