import { events } from './Events'
import Collection from './Collection'
import { storage } from './Storage'
import Order from './Order'
import room from './room'
import { localStorage, pullProps } from './util'


class OrderCollection extends Collection {

  constructor() {
    super()

    this._onMount()
  }

  _onMount() {
    room.subscribe('ready', () => {
      this._persistMyOrders()
    })

    room.subscribe('user online', (peer) => {
      let myOrders = this.getMyOrders()

      if (myOrders.length) {
        // clean orders from other additional props
        myOrders = this.items.map((item) => pullProps(
          item,
          'id',
          'owner',
          'buyCurrency',
          'sellCurrency',
          'buyAmount',
          'sellAmount',
          'isRequested',
          'isProcessing',
        ))

        console.log(`Send my orders to ${peer}`, myOrders)

        room.sendMessage(peer, [
          {
            event: 'new orders',
            data: {
              orders: myOrders,
            },
          },
        ])
      }
    })

    room.subscribe('user offline', (peer) => {
      const peerOrders = this.getPeerOrders(peer)

      if (peerOrders.length) {
        peerOrders.forEach(({ id }) => {
          this._handleRemove(id)
        })
      }
    })

    room.subscribe('new orders', ({ fromPeer, orders }) => {
      // ductape to check if such orders already exist
      const filteredOrders = orders.filter(({ id }) => !this.getByKey(id))

      console.log(`Receive orders from ${fromPeer}`, filteredOrders)

      this._handleMultipleCreate(filteredOrders)
    })

    room.subscribe('new order', ({ order: data }) => {
      this._handleCreate(data)
    })

    room.subscribe('remove order', ({ orderId }) => {
      this._handleRemove(orderId)
    })
  }

  _persistMyOrders() {
    this.getMyOrders().forEach((orderData) => {
      this._handleCreate(orderData)
    })
  }

  _create(data) {
    const order = new Order({
      collection: this,
      data,
    })

    this.append(order, order.id)

    return order
  }

  /**
   *
   * @param {object} data
   * @param {string} data.id
   * @param {object} data.owner
   * @param {string} data.owner.peer
   * @param {number} data.owner.reputation
   * @param {object} data.owner.<currency>
   * @param {string} data.owner.<currency>.address
   * @param {string} data.owner.<currency>.publicKey
   * @param {string} data.buyCurrency
   * @param {string} data.sellCurrency
   * @param {number} data.buyAmount
   * @param {number} data.sellAmount
   */
  _handleCreate(data) {
    const order = this._create(data)

    events.dispatch('new order', order)
  }

  _handleMultipleCreate(ordersData) {
    const orders = []

    ordersData.forEach((data) => {
      const order = this._create(data)
      orders.push(order)
    })

    events.dispatch('new orders', orders)
  }

  /**
   *
   * @param {string} orderId
   */
  _handleRemove(orderId) {
    const order = this.getByKey(orderId)

    this.removeByKey(orderId)
    events.dispatch('remove order', order)
  }

  _saveMyOrders() {
    let myOrders = this.items.filter(({ owner: { peer } }) => peer === storage.me.peer)

    // clean orders from other additional props
    // TODO need to add functionality to sync `requests` for users who going offline / online
    // problem: when I going online and persisting my orders need to show only online users requests,
    // but then user comes online need to change status. Ofc we can leave this bcs developers can do this themselves
    // with filters - skip requests where user is offline, but it looks like not very good
    myOrders = myOrders.map((item) => pullProps(
      item,
      'id',
      'owner',
      'buyCurrency',
      'sellCurrency',
      'buyAmount',
      'sellAmount',
      'participant',
      'requests',
      'isRequested',
      'isProcessing',
    ))

    localStorage.setItem('myOrders', myOrders)
  }

  getMyOrders() {
    return localStorage.getItem('myOrders') || []
  }

  getPeerOrders(peer) {
    return this.items.filter(({ owner }) => peer === owner.peer)
  }

  /**
   *
   * @param {object} data
   * @param {string} data.buyCurrency
   * @param {string} data.sellCurrency
   * @param {number} data.buyAmount
   * @param {number} data.sellAmount
   */
  create(data) {
    const order = this._create({
      ...data,
      owner: storage.me,
    })
    this._saveMyOrders()

    room.sendMessage([
      {
        event: 'new order',
        data: {
          order: pullProps(
            order,
            'id',
            'owner',
            'buyCurrency',
            'sellCurrency',
            'buyAmount',
            'sellAmount',
            'isRequested',
            'isProcessing',
          ),
        },
      },
    ])
  }

  /**
   *
   * @param {string} orderId
   */
  remove(orderId) {
    this.removeByKey(orderId)
    room.sendMessage([
      {
        event: 'remove order',
        data: {
          orderId,
        },
      },
    ])
    this._saveMyOrders()
  }
}


export default new OrderCollection()
