import diff from 'hyperdiff'
import EventEmitter from 'events'
import { cloneDeep as clone } from 'lodash'
import PeerId from 'peer-id'
import { PROTOCOL } from './protocol'
import Connection from './connection'
import encoding from './encoding'
import directConnection from './direct-connection-handler'
import namedQueryRun from '../../utils/namedQuery'


if (typeof window !== "undefined") {
  window.PeerId = PeerId
}


const DEFAULT_OPTIONS = {
  pollInterval: 1000
}

let index = 0

export default class PubSubRoom extends EventEmitter {
  _libp2p: any
  _topic: any
  _options: any
  _peers: any[]
  _connections: any
  _handleMessage: any
  _interval: NodeJS.Timeout
  _idx: number

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
    directConnection.emitter.on(this._topic, this._handleDirectMessage)

    this._libp2p.pubsub.subscribe(this._topic, this._handleMessage)

    this._libp2p.on('peer:discovery', async (peerId) => {
      const tryConnect = async (peerId, tryNumber, tryCounts) => {
        try {
          await this._libp2p.dialer.connectToPeer(peerId)
        } catch (e) {
          if (tryNumber > tryCounts) return
          setTimeout(async () => {
            await tryConnect(peerId, tryNumber+1, tryCounts)
          }, 1000)
        }
      }
      await tryConnect(peerId, 0, 1)
    })

    this._libp2p.on('error', (error) => {
      console.log('Libp2p error', error)
    })

    this._idx = index++
  }

  getPeers () {
    return this._peers.slice(0)
  }

  hasPeer (peer) {
    return Boolean(this._peers.find(p => p.toString() === peer.toString()))
  }

  async leave () {
    clearInterval(this._interval)
    Object.keys(this._connections).forEach((peer) => {
      this._connections[peer].stop()
    })
    directConnection.emitter.removeListener(this._topic, this._handleDirectMessage)
    this._libp2p.unhandle(PROTOCOL, directConnection.handler)
    await this._libp2p.pubsub.unsubscribe(this._topic, this._handleMessage)
  }

  async broadcast (_message) {
    const message = encoding(_message)

    const peersInTopic = this._libp2p.pubsub.topics.get(this._topic)
    if (peersInTopic) {
      peersInTopic.forEach((peerId) => {
        this.sendTo(peerId, _message)
      })
    }
  }

  sendTo (peer, message) {
    namedQueryRun({
      name: `libp2p_peer_${peer}`,
      delay: 100,
      func: async () => {
        if (!this._libp2p.peerStore.keyBook.data.has(peer)) {
          return
        }
        const toPeer = this._libp2p.peerStore.keyBook.data.get(peer)

        let conn = this._connections[peer]

        if (!conn) {
          conn = new Connection(toPeer, this._libp2p, this)
          conn.on('error', (err) => this.emit('error', err))
          this._connections[peer] = conn

          conn.once('disconnect', () => {
            delete this._connections[peer]
            this._peers = this._peers.filter((p) => p.toString() !== peer.toString())
            this.emit('peer left', peer)
          })
        }

        const seqno = Buffer.from([0])

        const msg = {
          to: toPeer,
          from: this._libp2p.peerId,
          data: Buffer.from(message).toString('hex'),
          seqno: seqno.toString('hex'),
          topicIDs: [this._topic],
          topicCIDs: [this._topic]
        }

        conn.push(Buffer.from(JSON.stringify(msg)))
      },
    })
  }

  async _pollPeers () {
    const newPeers = (await this._libp2p.pubsub.getSubscribers(this._topic)).sort()

    if (this._emitChanges(newPeers)) {
      this._peers = newPeers
    }
  }

  _emitChanges (newPeers) {
    const differences = diff(this._peers, newPeers)

    differences.added.forEach((peer) => this.emit('peer joined', peer))
    differences.removed.forEach((peer) => this.emit('peer left', peer))

    return differences.added.length > 0 || differences.removed.length > 0
  }

  _onMessage (message) {

    this.emit('message', message)
  }

  _handleDirectMessage (message) {
    if (message.to.id === this._libp2p.peerId._idB58String) {
      const m = Object.assign({}, message)
      delete m.to

      this.emit('message', m)
    }
  }
}
