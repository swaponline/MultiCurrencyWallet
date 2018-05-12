import Events from './Events'
import { storage } from './Storage'


class Room {

  constructor() {
    this.events = new Events()
  }

  init(config) {
    const ipfs = new global.Ipfs({
      EXPERIMENTAL: {
        pubsub: true,
      },
      config,
    })

    ipfs.once('ready', () => ipfs.id((err, info) => {
      console.info('IPFS ready!')

      if (err) {
        throw err
      }

      this._init({
        peer: info.id,
        ipfsConnection: ipfs,
      })
    }))
  }

  _init({ peer, ipfsConnection }) {
    storage.me.peer = peer

    this.connection = global.IpfsRoom(ipfsConnection, 'jswaps', {
      pollInterval: 5000,
    })

    this.connection.on('peer joined', this.handleUserOnline)
    this.connection.on('peer left', this.handleUserOffline)
    this.connection.on('message', this.handleNewMessage)

    this.events.dispatch('ready')
  }

  handleUserOnline = (peer) => {
    if (peer !== storage.me.peer) {
      this.events.dispatch('user online', peer)
    }
  }

  handleUserOffline = (peer) => {
    if (peer !== storage.me.peer) {
      this.events.dispatch('user offline', peer)
    }
  }

  handleNewMessage = (message) => {
    if (message.from === storage.me.peer) {
      return
    }

    const data = JSON.parse(message.data.toString())

    if (data && data.length) {
      data.forEach(({ event, data }) => {
        if (data) {
          this.events.dispatch(event, { ...data, fromPeer: message.from })

          if (this._handler) {
            this._handler({ ...data, fromPeer: message.from })
          }
        }
      })
    }
  }

  subscribe(eventName, handler) {
    this.events.subscribe(eventName, handler)
  }

  subscribe2(handler) {
    this._handler = handler
  }

  once(eventName, handler) {
    this.events.once(eventName, handler)
  }

  sendMessage(...args) {
    if (args.length === 1) {
      const [ message ] = args

      this.connection.broadcast(JSON.stringify(message))
    }
    else {
      const [ peer, message ] = args

      this.connection.sendTo(peer, JSON.stringify(message))
    }
  }
}


export default new Room()
