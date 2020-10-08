'use strict'

const EventEmitter = require('events')
const pipe = require('it-pipe')

const PROTOCOL = require('./protocol')
const encoding = require('./encoding')

module.exports = class Connection extends EventEmitter {
  constructor (remoteId, libp2p, room) {
    super()
    this._remoteId = remoteId
    this._libp2p = libp2p
    this._room = room
    this._connection = null
    this._connecting = false
  }

  push (message) {
    if (this._connection) {
      this._connection.push(encoding(message))

      return
    }

    this.once('connect', () => {
      this.push(message)
    })

    if (!this._connecting) {
      this._connect()
    }
  }

  stop () {
    if (this._connection) {
      this._connection.end()
    }
  }

  async _connect () {
    this._connecting = true

    if (!this._isConnectedToRemote()) {
      console.log('ipfsRoom _connect - is not connected')
      this.emit('disconnect')
      this._connecting = false
      return // early
    }

    console.log('_connect remoteId', this._remoteId)
    const peerInfo = this._libp2p.peerStore.get(this._remoteId)
    console.log('connect - to - peerInfo', peerInfo)
    const { stream } = await this._libp2p.dialProtocol(peerInfo.id, PROTOCOL)
    this._connection = new FiFoMessageQueue()

    pipe(this._connection, stream, async (source) => {
      console.log('connection - pipe', this._connection, stream, source)
      this._connecting = false
      this.emit('connect', this._connection)

      for await (const message of source) {
        console.log('call this.emit message', message)
        this.emit('message', message)
      }
    })
      .then(() => {
        console.log('on send end - disconnect')
        this.emit('disconnect')
      }, (err) => {
        console.log('on send error', err)
        this.emit('error', err)
      })
  }

  _isConnectedToRemote () {
    console.log('_isConnectedToRemote check', this._remoteId)
    for (const peerId of this._libp2p.connections.keys()) {
      console.log('check', this._remoteId._idB58String, peerId)
      if (peerId === this._remoteId._idB58String) {
        return true
      }
    }
  }
}

class FiFoMessageQueue {
  constructor () {
    this._queue = []
  }

  [Symbol.asyncIterator] () {
    return this
  }

  push (message) {
    if (this._ended) {
      throw new Error('Message queue ended')
    }

    if (this._resolve) {
      console.log('message push - resolve')
      return this._resolve({
        done: false,
        value: message
      })
    }

    this._queue.push(message)
  }

  end () {
    this._ended = true
    if (this._resolve) {
      this._resolve({
        done: true
      })
    }
  }

  next () {
    console.log('message - next')
    if (this._ended) {
      console.log('message - next - ended')
      return {
        done: true
      }
    }

    if (this._queue.length) {
      console.log('message - next - query length')
      const ret = {
        done: false,
        value: this._queue.shift()
      }
      console.log(ret)
      return ret
    }

    return new Promise((resolve) => {
      console.log('message - next - resolve')
      this._resolve = resolve
    })
  }
}
