import Events from './Events'
import { storage } from './Storage'


class Ws {

  constructor(address) {
    this.events       = new Events()
    this.connection   = new WebSocket(address)
    this.peer         = null

    this.connection.onopen = () => {
      console.log('WS: opened')

      this.send({
        event: 'connect',
        peer: localStorage.getItem('sockets:myPeer'),
      })
    }

    this.connection.onmessage = (e) => {
      const message = JSON.parse(e.data)
      const { fromPeer, data: messageData } = message

      // console.log('WS: new message', message)

      if (this.peer && fromPeer === this.peer) {
        return
      }

      if (Array.isArray(messageData)) {
        this.events.dispatch('message', message)
      }
      else if (typeof messageData === 'object') {
        const { event, data } = messageData

        // console.log('WS: new message:', event, data)

        if (!this.peer && event === 'connect') {
          this.peer = data.peer
          localStorage.setItem('sockets:myPeer', this.peer)
          this.events.dispatch(event, data)
        }
        else if (event) {
          this.events.dispatch(event, data)
        }
        else {
          this.events.dispatch('message', message)
        }
      }
    }

    this.connection.onclose = () => {
      console.log('WS: closed')
    }

    this.connection.onerror = (err) => {
      console.error('WS: error', err)
    }
  }

  send(message) {
    this.connection.send(JSON.stringify({
      fromPeer: this.peer,
      data: message,
    }))
  }

  sendTo(peer, message) {
    this.connection.send(JSON.stringify({
      fromPeer: this.peer,
      toPeer: peer,
      data: message,
    }))
  }

  on(eventName, handler) {
    this.events.subscribe(eventName, handler)
  }

  off(eventName, handler) {
    this.events.unsubscribe(eventName, handler)
  }
}


class RoomEmulator {

  constructor() {
    this.events = new Events()
  }

  init() {
    this.ws = new Ws('ws://127.0.0.1:7000')

    this.ws.on('connect', this._init)
  }

  _init = () => {
    storage.me.peer = this.ws.peer

    this.ws.on('peer joined', this.handleUserOnline)
    this.ws.on('peer left', this.handleUserOffline)
    this.ws.on('message', this.handleNewMessage)

    this.events.dispatch('ready')
  }

  handleUserOnline = ({ peer }) => {
    if (peer !== storage.me.peer) {
      this.events.dispatch('user online', peer)
    }
  }

  handleUserOffline = ({ peer }) => {
    if (peer !== storage.me.peer) {
      this.events.dispatch('user offline', peer)
    }
  }

  handleNewMessage = ({ fromPeer, data }) => {
    console.log('RoomEmulator: new message', { fromPeer, data })

    if (fromPeer === this.peer) {
      return
    }

    if (data && data.length) {
      data.forEach(({ event, data }) => {
        if (data) {
          this.events.dispatch(event, { fromPeer, ...(data || {}) })
        }
      })
    }
  }

  subscribe(event, handler) {
    this.events.subscribe(event, handler)
  }

  once(event, handler) {
    this.events.once(event, handler)
  }

  sendMessage(...args) {
    if (args.length === 1) {
      const [ message ] = args

      this.ws.send(message)
    }
    else {
      const [ peer, message ] = args

      this.ws.sendTo(peer, message)
    }
  }
}


export default new RoomEmulator()
