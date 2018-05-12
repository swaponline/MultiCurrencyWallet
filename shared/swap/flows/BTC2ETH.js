import crypto from 'bitcoinjs-lib/src/crypto'
import Flow from '../Flow'
import room from '../room'
import { storage } from '../Storage'


class BTC2ETH extends Flow {

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
    const flow = this

    return [

      // 1. Signs

      () => {
        const { id } = this.swap

        room.subscribe('swap sign', function ({ orderId }) {
          if (id === orderId) {
            this.unsubscribe()

            const { isMeSigned, isParticipantSigned } = flow.state

            if (isMeSigned && isParticipantSigned) {
              flow.finishStep({
                isParticipantSigned: true,
              })
            }
            else {
              flow.setState({
                isParticipantSigned: true,
              })
            }
          }
        })
      },

      // 2. Create secret, secret hash

      () => {
        console.log(99999)
      },

      // 3. Check balance

      () => {
        this.syncBalance()
      },

      // 4. Create BTC Script, fund, notify participant

      async () => {
        const { id, sellAmount, participant } = this.swap

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

        room.sendMessage(participant.peer, [
          {
            event: 'create btc script',
            data: {
              orderId: id,
              scriptValues,
            },
          },
        ])

        flow.finishStep({
          isBtcScriptFunded: true,
        })
      },

      // 5. Wait participant creates ETH Contract

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

      // 6. Withdraw

      async () => {
        const { id, participant } = this.swap
      
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

        room.sendMessage(participant.peer, [
          {
            event: 'finish eth withdraw',
            data: {
              orderId: id,
            },
          },
        ])

        flow.finishStep({
          isEthWithdrawn: true,
        })
      },

      // 7. Finish

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


export default BTC2ETH
