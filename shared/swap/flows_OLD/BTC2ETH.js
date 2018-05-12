import crypto from 'bitcoinjs-lib/src/crypto'
import Flow from '../Flow'
import room from '../room'
import { storage } from '../Storage'


class BTC2ETH extends Flow {

  /*

    Flow storage data:

    {string}    signTransactionUrl
    {boolean}   isSignFetching
    {boolean}   isMeSigned
    {boolean}   isParticipantSigned

    {string}    secret
    {string}    secretHash
    {boolean}   isBalanceFetching
    {boolean}   isBalanceEnough
    {object}    btcScriptData
    {boolean}   isBtcScriptFunded
    {boolean}   isEthContractFunded
    {string}    ethSwapWithdrawTransactionUrl
    {boolean}   isWithdrawn

   */

  constructor({ swap, data, options: { ethSwap, btcSwap, getBalance } }) {
    super({ swap })

    if (!ethSwap) {
      throw new Error('BTC2ETH failed. "ethSwap" of type object required.')
    }
    if (!btcSwap) {
      throw new Error('BTC2ETH failed. "btcSwap" of type object required.')
    }
    if (typeof getBalance !== 'function') {
      throw new Error('BTC2ETH failed. "getBalance" of type function required.')
    }

    this.ethSwap    = ethSwap
    this.btcSwap    = btcSwap
    this.getBalance = getBalance

    this._persistState()
  }

  _getSteps() {
    const flow = this

    return [

      // Signs

      () => {
        console.log(8888)

        const { id } = this.swap

        room.subscribe('swap sign', function ({ orderId }) {
          if (id === orderId) {
            this.unsubscribe()

            flow.finishStep({
              isParticipantSigned: true,
            })

            const { isMeSigned, isParticipantSigned } = flow.storage

            if (isMeSigned && isParticipantSigned) {
              flow.finishStep()
            }
          }
        })
      },

      // Create secret, secret hash

      () => {
        console.log(99999)
      },

      // Check balance

      () => {
        this.syncBalance()
      },

      // Create BTC Script

      () => {
        const { participant } = this.swap

        const btcScriptData = this.btcSwap.createScript({
          secretHash:         flow.storage.secretHash,
          btcOwnerPublicKey:  storage.me.btc.publicKey,
          ethOwnerPublicKey:  participant.btc.publicKey,
        })

        // Timeout to show dumb loader - like smth is going
        setTimeout(() => {
          flow.finishStep({
            btcScriptData,
          })
        }, 1500)
      },

      // Fund BTC Script, notify participant

      async () => {
        const { id, sellAmount, participant } = this.swap

        await this.btcSwap.fundScript({
          myAddress:  storage.me.btc.address,
          myKeyPair:  storage.me.btc,
          script:     flow.storage.btcScriptData.script,
          amount:     sellAmount,
        })

        room.sendMessage(participant.peer, [
          {
            event: 'create btc script',
            data: {
              orderId:        id,
              secretHash:     flow.storage.secretHash,
              btcScriptData:  flow.storage.btcScriptData,
            },
          },
        ])

        flow.finishStep({
          isBtcScriptFunded: true,
        })
      },

      // Wait participant creates ETH Contract

      () => {
        const { id } = this.swap
      
        room.subscribe('create eth contract', function ({ orderId }) {
          if (id === orderId) {
            this.unsubscribe()

            flow.finishStep({
              isEthContractFunded: true,
            })
          }
        })
      },

      // Withdraw

      async () => {
        const { id, participant } = this.swap
      
        const data = {
          myAddress:      storage.me.eth.address,
          ownerAddress:   participant.eth.address,
          secret:         flow.storage.secret,
        }

        await this.ethSwap.withdraw(data, (transactionHash) => {
          flow.storage.update({
            ethSwapWithdrawTransactionUrl: transactionHash,
          })
        })

        room.sendMessage(participant.peer, [
          {
            event: 'finish eth withdraw',
            data: {
              orderId: id,
            },
          },
        ])

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

  submitSecret(secret) {
    const secretHash = crypto.ripemd160(Buffer.from(secret, 'hex')).toString('hex')

    this.finishStep({
      secret,
      secretHash,
    })
  }

  async syncBalance() {
    const { sellAmount } = this.swap

    this.storage.update({
      isBalanceFetching: true,
    })

    const balance = await this.getBalance()
    const isEnoughMoney = sellAmount <= balance

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


export default BTC2ETH
