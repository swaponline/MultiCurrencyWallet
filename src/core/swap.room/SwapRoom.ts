import debug from 'debug'
import SwapApp, { constants, Events, ServiceInterface } from 'swap.app'

import createP2PNode from '../../common/messaging/pubsubRoom/createP2PNode'
import p2pRoom from '../../common/messaging/pubsubRoom'


class SwapRoom extends ServiceInterface {

  _serviceName: string
  _config: any
  _events: any
  peer: any
  connection: any
  roomName: string

  CheckReceiptsT: any
  //@ts-ignore
  static get name() {
    return 'room'
  }

  constructor(config) {
    super()

    if (!config || typeof config !== 'object' || typeof config.config !== 'object') {
      throw new Error('SwapRoomService: "config" of type object required')
    }

    this._serviceName   = 'room'
    this._config        = config
    this._events        = new Events()
    this.peer           = null
    this.connection     = null
    //@ts-ignore: strictNullChecks
    this.roomName       = null
  }

  initService() {
    const peerIdJson = this.app.env.storage.getItem(
      'libp2p:peerIdJson'
    )
    createP2PNode({
      peerIdJson,
    }).then((p2pNode: any) => {
      // Save PeerId
      this.app.env.storage.setItem(
        'libp2p:peerIdJson',
        p2pNode.peerId.toJSON()
      )
      // Start p2p node
      p2pNode.start().then(async () => {
        this._init({
          peer: {
            id: p2pNode.peerId._idB58String,
          },
          p2pConnection: p2pNode,
        })
      }).catch((error) => {
        console.log('Fail start p2pnode', error)
      })
    })
  }


  _init({ peer, p2pConnection }) {
    console.info('Room: init...')
    if (!p2pConnection) {
      setTimeout(() => {
        this._init({ peer, p2pConnection })
      }, 999)
      return
    }

    this.peer = peer.id

    const defaultRoomName = this.app.env.isTest ? 'tests.swap.online'
      : this.app.isMainNet()
        ?  'swap.online'
        :  'testnet-tt.swap.online'

    this.roomName = this._config.roomName || defaultRoomName

    debug('swap.core:room')(`Using room: ${this.roomName}`)

    this.connection = new p2pRoom(p2pConnection, this.roomName, {
      pollInterval: 1000,
    })

    this.connection.isOnline = () => {
      console.log('Call pubsubRoom isOnline')
      // @ToDo - may be use isStarted
      return true
    }

    this.connection.on('peer joined', this._handleUserOnline)
    this.connection.on('peer left', this._handleUserOffline)
    this.connection.on('message', this._handleNewMessage)

    this._events.dispatch('ready')
    console.info(`Room: ready! (${this.roomName})`)
  }

  _handleUserOnline = (peer) => {
    if (peer !== this.peer) {
      this._events.dispatch('user online', peer)
    }
  }

  _handleUserOffline = (peer) => {
    if (peer !== this.peer) {
      this._events.dispatch('user offline', peer)
    }
  }

  _handleNewMessage = (message) => {
    const { from, data: rawData } = message
    debug('swap.verbose:room')('message from', from)


    if (from === this.peer) {
      return
    }

    let parsedData

    try {
      parsedData = JSON.parse(rawData.toString())
    } catch (err) {
      console.error('parse message data err:', err)
    }

    const { fromAddress, data, sign, event, action } = parsedData

    if (!data) {
      return
    }

    debug('swap.verbose:room')('data:', parsedData)

    const recover = this._recoverMessage(data, sign)

    if (recover !== fromAddress) {
      console.error(`Wrong message sign! Message from: ${fromAddress}, recover: ${recover}`)
      return
    }

    if (action === 'active') {
      this.acknowledgeReceipt(parsedData)
    }

    this._events.dispatch(event, {
      fromPeer: from.id,
      ...data,
    })
  }

  on(eventName, handler) {
    this._events.subscribe(eventName, handler)
    return this
  }

  off(eventName, handler) {
    this._events.unsubscribe(eventName, handler)
    return this
  }

  once(eventName, handler) {
    this._events.once(eventName, handler)
    return this
  }

  subscribe(eventName, handler) {
    this._events.subscribe(eventName, handler)
    return this
  }

  unsubscribe(eventName, handler) {
    this._events.unsubscribe(eventName, handler)
    return this
  }

  _recoverMessage(message, sign) {
    const hash      = this.app.env.web3.utils.soliditySha3(JSON.stringify(message))
    const recover   = this.app.env.web3.eth.accounts.recover(hash, sign.signature)

    return recover
  }

  _signMessage(message) {
    const hash  = this.app.env.web3.utils.soliditySha3(JSON.stringify(message))
    const sign  = this.app.env.web3.eth.accounts.sign(hash, this.app.services.auth.accounts.eth.privateKey)

    return sign
  }

  checkReceiving(message, callback) {
    let address = message.fromAddress

    const waitReceipt = (data) => {
      if (!data.action || data.action !== 'confirmation') {
        return
      }

      if (JSON.stringify(message.data) === JSON.stringify(data.message)) {
        this.unsubscribe(address, waitReceipt)

        if (this.CheckReceiptsT[message.peer]) {
          clearTimeout(this.CheckReceiptsT[message.peer])
        }

        callback(true)
      }
    }

    this.subscribe(address, waitReceipt)

    if (!this.CheckReceiptsT) {
      this.CheckReceiptsT = {}
    }

    this.CheckReceiptsT[message.peer] = setTimeout(() => {
      this.unsubscribe(address, waitReceipt)

      callback(false)
    }, 15000)
  }

  sendConfirmation(peer, message, callback = null, repeat = 9) {
    if (!this.connection) {
      setTimeout(() => {
        this.sendConfirmation(peer, message, callback, repeat)
      }, 1000)
      return
    }

    if (message.action === 'confirmation' && peer !== this.peer) {
      return
    }

    message = this.sendMessagePeer(peer, message)

    this.checkReceiving(message, delivered => {
      if (!delivered && repeat > 0) {
        repeat--
        setTimeout(() => {
          this.sendConfirmation(peer, message, callback, repeat)
        }, 1000)
        return
      }

      if (typeof callback === 'function') {
        //@ts-ignore: strictNullChecks
        callback(delivered)
      }
    })
  }

  acknowledgeReceipt(message) {
    if (!message.peer || !message.action
      || message.action  === 'confirmation'
      || message.action  === 'active') {
      return
    }

    const { fromAddress, data } = message

    this.sendMessagePeer(fromAddress, {
      action  : 'confirmation',
      data,
    })
  }

  sendMessagePeer(peer, message) {
    if (!this.connection) {
      if (message.action !== 'active') {
        setTimeout(() => {
          this.sendMessagePeer(peer, message)
        }, 999)
      }
      return
    }

    debug('swap.verbose:room')('sent message to peer', peer)
    // debug('swap.verbose:room')('message', message)

    const { data, event }  = message
    const sign = this._signMessage(data)

    this.connection.sendTo(peer, JSON.stringify({
      fromAddress: this.app.services.auth.accounts.eth.address,
      data,
      event,
      sign,
    }))

    return message
  }

  sendMessageRoom(message) {
    if (!this.connection) {
      setTimeout(() => {
        this.sendMessageRoom(message)
      }, 1000)
      return
    }

    const { data, event } = message
    const sign = this._signMessage(data)

    this.connection.broadcast(JSON.stringify({
      fromAddress: this.app.services.auth.accounts.eth.address,
      data,
      event,
      sign,
    }))
  }
}


export default SwapRoom
