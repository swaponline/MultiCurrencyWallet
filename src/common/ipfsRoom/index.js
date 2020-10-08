'use strict'

const diff = require('hyperdiff')
const EventEmitter = require('events')
const clone = require('lodash.clonedeep')
const PeerId = require('peer-id')


const PROTOCOL = require('./protocol')
const Connection = require('./connection')
const encoding = require('./encoding')
const directConnection = require('./direct-connection-handler')

const DEFAULT_OPTIONS = {
  pollInterval: 1000
}

let index = 0

class PubSubRoom extends EventEmitter {
  constructor (libp2p, topic, options) {
    super()
    this._libp2p = libp2p.libp2p || libp2p
    this._topic = topic
    this._options = Object.assign({}, clone(DEFAULT_OPTIONS), clone(options))
    this._peers = []
    this._connections = {}

    this._handleDirectMessage = this._handleDirectMessage.bind(this)
    this._handleMessage = this._onMessage.bind(this)

    if (!this._libp2p.pubsub) {
      throw new Error('pubsub has not been configured')
    }

    this._interval = setInterval(
      this._pollPeers.bind(this),
      this._options.pollInterval
    )

    this._libp2p.handle(PROTOCOL, directConnection.handler)
    console.log('directConnection.emitter', this._topic)
    directConnection.emitter.on(this._topic, this._handleDirectMessage)

    this._libp2p.pubsub.subscribe(this._topic, this._handleMessage)

    this._idx = index++
  }

  getPeers () {
    return this._peers.slice(0)
  }

  hasPeer (peer) {
    return Boolean(this._peers.find(p => p.toString() === peer.toString()))
  }

  async leave () {
    console.log('ipfsRoom - leave')
    clearInterval(this._interval)
    Object.keys(this._connections).forEach((peer) => {
      this._connections[peer].stop()
    })
    directConnection.emitter.removeListener(this._topic, this._handleDirectMessage)
    this._libp2p.unhandle(PROTOCOL, directConnection.handler)
    await this._libp2p.pubsub.unsubscribe(this._topic, this._handleMessage)
  }

  async broadcast (_message) {
    console.log('ipfsRoom - broadcast',_message)
    const message = encoding(_message)

    await this._libp2p.pubsub.publish(this._topic, message)
  }

  sendTo (peer, message) {
    console.log('ipfsRoom - sendTo', peer, message)
    if (!this._libp2p.peerStore.keyBook.data.has(peer)) {
      console.error('Room - peer not found', peer)
      return
    }
    const toPeer = this._libp2p.peerStore.keyBook.data.get(peer)
    console.log('ipfsRoom - Connections', this._connections, peer)
    let conn = this._connections[peer]
    console.log('ipfsRoom - peer connection', conn)
    if (!conn) {
      conn = new Connection(toPeer, this._libp2p, this)
      conn.on('error', (err) => this.emit('error', err))
      this._connections[peer] = conn

      conn.once('disconnect', () => {
        console.log('ipfsRoom disconnect')
        delete this._connections[peer]
        this._peers = this._peers.filter((p) => p.toString() !== peer.toString())
        this.emit('peer left', peer)
      })
    }

    // We should use the same sequence number generation as js-libp2p-floosub does:
    // const seqno = Buffer.from(utils.randomSeqno())

    // Until we figure out a good way to bring in the js-libp2p-floosub's randomSeqno
    // generator, let's use 0 as the sequence number for all private messages
    // const seqno = Buffer.from([0])
    const seqno = Buffer.from([0])

    
    console.log('ipfsRoom - toPeer', toPeer)
    console.log('ipfsRoom - peer from cid', PeerId.createFromB58String(peer))

    const msg = {
      to: toPeer,
      from: this._libp2p.peerId,
      data: Buffer.from(message).toString('hex'),
      seqno: seqno.toString('hex'),
      topicIDs: [this._topic],
      topicCIDs: [this._topic]
    }
    console.log('ipfsRoom - message', msg)

    conn.push(Buffer.from(JSON.stringify(msg)))
  }

  async _pollPeers () {
    //console.log('ipfsRoom - _pollPeers')
    const newPeers = (await this._libp2p.pubsub.getSubscribers(this._topic)).sort()

    if (this._emitChanges(newPeers)) {
      this._peers = newPeers
    }
  }

  _emitChanges (newPeers) {
    // console.log('ipfsRoom - _emitChanges', newPeers)
    const differences = diff(this._peers, newPeers)

    differences.added.forEach((peer) => this.emit('peer joined', peer))
    differences.removed.forEach((peer) => this.emit('peer left', peer))

    return differences.added.length > 0 || differences.removed.length > 0
  }

  _onMessage (message) {
    console.log('ipfsRoom - _onMessage', message)
    this.emit('message', message)
  }

  _handleDirectMessage (message) {
    console.log('ipfsRoom - _handleDirectMessage', message)
    if (message.to.id === this._libp2p.peerId._idB58String) {
      const m = Object.assign({}, message)
      delete m.to
      console.log('ipfsRoom - _handleDirectMessage - our', m)
      this.emit('message', m)
    }
  }
}

module.exports = PubSubRoom
