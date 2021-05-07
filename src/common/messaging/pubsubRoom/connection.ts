'use strict'

import { EventEmitter } from 'events'
import pipe from 'it-pipe'


import { PROTOCOL } from './protocol'
import encoding from './encoding'

import debug from 'debug'


export default class Connection extends EventEmitter {

  _remoteId: any
  _libp2p: any
  _room: any
  _connection: any
  _connecting: any

  constructor (remoteId, libp2p, room) {
    super()
    this._remoteId = remoteId
    this._libp2p = libp2p
    this._room = room
    this._connection = null
    this._connecting = false
  }

  push(message) {
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

  stop() {
    if (this._connection) {
      this._connection.end()
    }
  }

  async _connect() {
    this._connecting = true

    if (!this._isConnectedToRemote()) {
      this.emit('disconnect')
      this._connecting = false
      return // early
    }

    const peerInfo = this._libp2p.peerStore.get(this._remoteId)

    const dial = await this._libp2p.dialProtocol(peerInfo.id, PROTOCOL)

    const { stream } = dial

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
      }, async (err) => {
        try {
          await this._connect()
        } catch (e) {
          console.log('Fail reconnect')
        }
      })
  }

  _isConnectedToRemote() {
    for (const peerId of this._libp2p.connections.keys()) {
      if (peerId === this._remoteId._idB58String) {
        return true
      }
    }
  }
}

class FiFoMessageQueue {

  _queue: any[]
  _ended: boolean
  _resolve: any

  constructor () {
    this._queue = []
  }

  [Symbol.asyncIterator] () {
    return this
  }

  push(message) {
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

  end() {
    this._ended = true
    if (this._resolve) {
      this._resolve({
        done: true
      })
    }
  }

  next() {
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
