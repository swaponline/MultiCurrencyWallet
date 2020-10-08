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
      this.emit('disconnect')
      this._connecting = false
      return // early
    }

    const peerInfo = this._libp2p.peerStore.get(this._remoteId)
    const { stream } = await this._libp2p.dialProtocol(peerInfo, PROTOCOL)
    this._connection = new FiFoMessageQueue()

    pipe(this._connection, stream, async (source) => {
      this._connecting = false
      this.emit('connect', this._connection)

      for await (const message of source) {
        this.emit('message', message)
      }
    })
      .then(() => {
        this.emit('disconnect')
      }, (err) => {
        this.emit('error', err)
      })
  }

  _isConnectedToRemote () {
    for (const peerId of this._libp2p.connections.keys()) {
      if (peerId === this._remoteId) {
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
    if (this._ended) {
      return {
        done: true
      }
    }

    if (this._queue.length) {
      return {
        done: false,
        value: this._queue.shift()
      }
    }

    return new Promise((resolve) => {
      this._resolve = resolve
    })
  }
}
