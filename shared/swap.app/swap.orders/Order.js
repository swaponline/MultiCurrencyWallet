import SwapApp from 'swap.app'
import events from './events'


class Order {

  /**
   *
   * @param {object}  parent
   * @param {object}  data
   * @param {string}  data.id
   * @param {object}  data.owner
   * @param {string}  data.owner.peer
   * @param {number}  data.owner.reputation
   * @param {object}  data.owner.<currency>
   * @param {string}  data.owner.<currency>.address
   * @param {string}  data.owner.<currency>.publicKey
   * @param {string}  data.buyCurrency
   * @param {string}  data.sellCurrency
   * @param {number}  data.buyAmount
   * @param {number}  data.sellAmount
   */
  constructor(parent, data) {
    this.id             = data.id
    this.isMy           = null
    this.owner          = null
    this.participant    = null
    this.buyCurrency    = null
    this.sellCurrency   = null
    this.buyAmount      = null
    this.sellAmount     = null

    this.collection     = parent
    this.requests       = [] // income requests
    this.isRequested    = false // outcome request status
    this.isProcessing   = false // if swap isProcessing

    this._update({
      ...data,
      isMy: data.owner.peer === SwapApp.services.room.peer,
    })

    this._onMount()
  }

  _onMount() {
    SwapApp.services.room.subscribe('request swap', ({ orderId, participant }) => {
      if (orderId === this.id && !this.requests.find(({ peer }) => peer === participant.peer)) {
        this.requests.push(participant)

        events.dispatch('new order request', {
          orderId,
          participant,
        })
      }
    })
  }

  _update(values) {
    Object.keys(values).forEach((key) => {
      this[key] = values[key]
    })
  }

  update(values) {
    this._update(values)
    this.collection._saveMyOrders()

    events.dispatch('swap update', this, values)
  }

  /**
   *
   * @param callback - awaiting for response - accept / decline
   */
  sendRequest(callback) {
    const self = this

    if (SwapApp.services.room.peer === this.owner.peer) {
      console.warn('You are the owner of this Order. You can\'t send request to yourself.')
      return
    }

    if (this.isRequested) {
      console.warn('You have already requested this swap.')
      return
    }

    this.update({
      isRequested: true,
    })

    SwapApp.services.room.sendMessage(this.owner.peer, [
      {
        event: 'request swap',
        data: {
          orderId: this.id,
          // TODO why do we send this info?
          participant: SwapApp.services.auth.getPublicData(),
        },
      },
    ])

    SwapApp.services.room.subscribe('accept swap request', function ({ orderId }) {
      if (orderId === self.id) {
        this.unsubscribe()

        self.update({
          isProcessing: true,
          isRequested: false,
        })

        callback(true)
      }
    })

    SwapApp.services.room.subscribe('decline swap request', function ({ orderId }) {
      if (orderId === self.id) {
        this.unsubscribe()

        self.update({
          isRequested: false,
        })

        // TODO think about preventing user from sent requests every N seconds
        callback(false)
      }
    })
  }

  acceptRequest(participantPeer) {
    const participant = this.requests.find(({ peer }) => peer === participantPeer)

    this.update({
      isRequested: false,
      isProcessing: true,
      participant,
      requests: [],
    })

    SwapApp.services.room.sendMessage(participantPeer, [
      {
        event: 'accept swap request',
        data: {
          orderId: this.id,
        },
      },
    ])
  }

  declineRequest(participantPeer) {
    let index

    this.requests.some(({ peer }, _index) => {
      if (peer === participantPeer) {
        index = _index
      }
      return index !== undefined
    })

    const requests = [
      ...this.requests.slice(0, index),
      ...this.requests.slice(index + 1)
    ]

    this.update({
      isRequested: false,
      requests,
    })

    SwapApp.services.room.sendMessage(participantPeer, [
      {
        event: 'decline swap request',
        data: {
          orderId: this.id,
        },
      },
    ])
  }
}


export default Order
