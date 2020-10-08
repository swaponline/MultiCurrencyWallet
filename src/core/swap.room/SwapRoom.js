import debug from 'debug'
import SwapApp, { constants, Events, ServiceInterface } from 'swap.app'

import createP2PNode from '../../common/ipfsRoom/createP2PNode'
import p2pRoom from '../../common/ipfsRoom'



class SwapRoom extends ServiceInterface {

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
    this.roomName       = null
  }

  initService() {
    /*
    console.log('createP2PNode', createP2PNode)
    const p2pNode = createP2PNode()
    console.log('p2pNode', p2pNode)
    p2pNode.start().then(() => {
      console.log('p2pNode started')
      
      const { roomName } = this._config
      console.log('node', node)
      const room = new p2pRoom(node, roomName)
      console.log('room', room)
      window.ourRoom = room
      window.ourNode = node
      room.on('peer joined', (peer) => {
        console.log('Peer joined the room', peer)
      })

      room.on('peer left', (peer) => {
        console.log('Peer left...', peer)
      })

      // now started to listen to room
      room.on('subscribed', () => {
        console.log('Now connected!')
      })
      .on('ready', () => {
        console.log('room ready')
      })
      
    }).catch((error) => {
      console.log('Fail start p2pnode', error)
    })
    */
    
    if (!this.app.env.Ipfs) {
      throw new Error('SwapRoomService: Ipfs required')
    }
    if (!this.app.env.IpfsRoom) {
      throw new Error('SwapRoomService: IpfsRoom required')
    }

    const { roomName, EXPERIMENTAL, ...config } = this._config

    this.app.env.Ipfs.create({
      EXPERIMENTAL: {
        pubsub: true,
      },
      ...config,
    }).then(async (ipfs) => {
      console.log('ipfs created', ipfs)
      window.ourIpfs = ipfs

      const peerId = await ipfs.id()
      this._init({
        peer: peerId,
        ipfsConnection: ipfs,
      })
      
      
    }).catch((error) => {
      console.log('Fail create ipfs', error)
      debug('swap.core:room')('IPFS error!', err)
    })
    
  }

  _init({ peer, ipfsConnection }) {
    console.log('call _init', peer, ipfsConnection)
    if (!ipfsConnection) {
      setTimeout(() => {
        this._init({ peer, ipfsConnection })
      }, 999)
      return
    }

    this.peer = peer.id

    const defaultRoomName = this.app.isMainNet()
                  ? 'swap.online'
                  : 'testnet.swap.online'

    this.roomName = this._config.roomName || defaultRoomName

    console.log(`Using room: ${this.roomName}`)
    debug('swap.core:room')(`Using room: ${this.roomName}`)

    this.connection = new this.app.env.IpfsRoom(ipfsConnection, this.roomName, {
      pollInterval: 1000,
    })

    this.connection._ipfs = ipfsConnection
    
    this.connection._libp2p.peerInfo = ipfsConnection.peerInfo

    window.ourConnection = this.connection
    console.log('our room', this.connection)
    window.ourRoom = this.connection
    this.connection.on('peer joined', this._handleUserOnline)
    this.connection.on('peer left', this._handleUserOffline)
    this.connection.on('message', this._handleNewMessage)

    this._events.dispatch('ready')
  }

  _handleUserOnline = (peer) => {
    console.log('_handleUserOnline', peer)
    if (peer !== this.peer) {
      console.log('_handleUserOnline - not me')
      console.log('me', this.peer)
      console.log('he', peer)
      this._events.dispatch('user online', peer)
    } else {
      console.log('_handleUserOnline - me????')
      console.log('me', this.peer)
      console.log('he', peer)
    }
  }

  _handleUserOffline = (peer) => {
    console.log('_handleUserOffline', peer)
    if (peer !== this.peer) {
      this._events.dispatch('user offline', peer)
    }
  }

  _handleNewMessage = (message) => {
    console.log('_handleNewMessage', message)
    const { from, data: rawData } = message
    debug('swap.verbose:room')('message from', from)

    
    if (from === this.peer) {
      console.log('from != this.peer', from, this.peer)
      return
    }

    let parsedData

    try {
      parsedData = JSON.parse(rawData.toString())
    }
    catch (err) {
      console.error('parse message data err:', err)
    }

    console.log('new message parsed', parsedData)
    const { fromAddress, data, sign, event, action } = parsedData

    if (!data) {
      return
    }

    // debug('swap.verbose:room')('parsedData', parsedData)

    const recover = this._recoverMessage(data, sign)

    console.log('after recover', recover)
    if (recover !== fromAddress) {
      console.error(`Wrong message sign! Message from: ${fromAddress}, recover: ${recover}`)
      return
    }

    if (action === 'active') {
      this.acknowledgeReceipt(parsedData)
    }

    console.log('dispatch event', event, from, data)
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

  subscribe (eventName, handler) {
    this._events.subscribe(eventName, handler)
    return this
  }

  unsubscribe (eventName, handler) {
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

  sendConfirmation(peer, message, callback = false, repeat = 9) {

    if (!this.connection) {
      setTimeout(() => { this.sendConfirmation(peer, message, callback, repeat) }, 1000)
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
        }, 1000 )
        return
      }

      if (callback) callback(delivered)
    })
  }

  acknowledgeReceipt (message) {
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

    console.log('sent message to peer', peer)
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
