'use strict'

const debug = require('debug')
/** @typedef {import('../types').EventEmitterFactory} Events */
/** @type Events */
const EventEmitter = require('events')
const errcode = require('err-code')

const { pipe } = require('it-pipe')

const MulticodecTopology = require('../topology/multicodec-topology')
const { codes } = require('./errors')
/**
 * @type {typeof import('./message')}
 */
const message = require('./message')
const PeerStreams = require('./peer-streams')
const { SignaturePolicy } = require('./signature-policy')
const utils = require('./utils')

const {
  signMessage,
  verifySignature
} = require('./message/sign')

/**
 * @typedef {any} Libp2p
 * @typedef {import('peer-id')} PeerId
 * @typedef {import('bl')} BufferList
 * @typedef {import('../stream-muxer/types').MuxedStream} MuxedStream
 * @typedef {import('../connection/connection')} Connection
 * @typedef {import('./message').RPC} RPC
 * @typedef {import('./message').SubOpts} RPCSubOpts
 * @typedef {import('./message').Message} RPCMessage
 * @typedef {import('./signature-policy').SignaturePolicyType} SignaturePolicyType
 */

/**
 * @typedef {Object} InMessage
 * @property {string} [from]
 * @property {string} receivedFrom
 * @property {string[]} topicIDs
 * @property {Uint8Array} [seqno]
 * @property {Uint8Array} data
 * @property {Uint8Array} [signature]
 * @property {Uint8Array} [key]
 */

/**
 * PubsubBaseProtocol handles the peers and connections logic for pubsub routers
 * and specifies the API that pubsub routers should have.
 */
class PubsubBaseProtocol extends EventEmitter {
  /**
   * @param {Object} props
   * @param {string} props.debugName - log namespace
   * @param {Array<string>|string} props.multicodecs - protocol identificers to connect
   * @param {Libp2p} props.libp2p
   * @param {SignaturePolicyType} [props.globalSignaturePolicy = SignaturePolicy.StrictSign] - defines how signatures should be handled
   * @param {boolean} [props.canRelayMessage = false] - if can relay messages not subscribed
   * @param {boolean} [props.emitSelf = false] - if publish should emit to self, if subscribed
   * @abstract
   */
  constructor ({
    debugName,
    multicodecs,
    libp2p,
    globalSignaturePolicy = SignaturePolicy.StrictSign,
    canRelayMessage = false,
    emitSelf = false
  }) {
    if (typeof debugName !== 'string') {
      throw new Error('a debugname `string` is required')
    }

    if (!multicodecs) {
      throw new Error('multicodecs are required')
    }

    if (!libp2p) {
      throw new Error('libp2p is required')
    }

    super()

    this.log = debug(debugName)
    this.log.err = debug(`${debugName}:error`)

    /**
     * @type {Array<string>}
     */
    this.multicodecs = utils.ensureArray(multicodecs)
    this._libp2p = libp2p
    this.registrar = libp2p.registrar
    /**
     * @type {PeerId}
     */
    this.peerId = libp2p.peerId

    this.started = false

    /**
     * Map of topics to which peers are subscribed to
     *
     * @type {Map<string, Set<string>>}
     */
    this.topics = new Map()

    /**
     * List of our subscriptions
     *
     * @type {Set<string>}
     */
    this.subscriptions = new Set()

    /**
     * Map of peer streams
     *
     * @type {Map<string, import('./peer-streams')>}
     */
    this.peers = new Map()

    // validate signature policy
    if (!SignaturePolicy[globalSignaturePolicy]) {
      throw errcode(new Error('Invalid global signature policy'), codes.ERR_INVALID_SIGUATURE_POLICY)
    }

    /**
     * The signature policy to follow by default
     *
     * @type {string}
     */
    this.globalSignaturePolicy = globalSignaturePolicy

    /**
     * If router can relay received messages, even if not subscribed
     *
     * @type {boolean}
     */
    this.canRelayMessage = canRelayMessage

    /**
     * if publish should emit to self, if subscribed
     *
     * @type {boolean}
     */
    this.emitSelf = emitSelf

    /**
     * Topic validator function
     *
     * @typedef {function(string, InMessage): Promise<void>} validator
     */
    /**
     * Topic validator map
     *
     * Keyed by topic
     * Topic validators are functions with the following input:
     *
     * @type {Map<string, validator>}
     */
    this.topicValidators = new Map()

    this._registrarId = undefined
    this._onIncomingStream = this._onIncomingStream.bind(this)
    this._onPeerConnected = this._onPeerConnected.bind(this)
    this._onPeerDisconnected = this._onPeerDisconnected.bind(this)
  }

  // LIFECYCLE METHODS

  /**
   * Register the pubsub protocol onto the libp2p node.
   *
   * @returns {void}
   */
  start () {
    if (this.started) {
      return
    }
    this.log('starting')

    // Incoming streams
    // Called after a peer dials us
    this.registrar.handle(this.multicodecs, this._onIncomingStream)

    // register protocol with topology
    // Topology callbacks called on connection manager changes
    const topology = new MulticodecTopology({
      multicodecs: this.multicodecs,
      handlers: {
        onConnect: this._onPeerConnected,
        onDisconnect: this._onPeerDisconnected
      }
    })
    this._registrarId = this.registrar.register(topology)

    this.log('started')
    this.started = true
  }

  /**
   * Unregister the pubsub protocol and the streams with other peers will be closed.
   *
   * @returns {void}
   */
  stop () {
    if (!this.started) {
      return
    }

    // unregister protocol and handlers
    this.registrar.unregister(this._registrarId)

    this.log('stopping')
    this.peers.forEach((peerStreams) => peerStreams.close())

    this.peers = new Map()
    this.subscriptions = new Set()
    this.started = false
    this.log('stopped')
  }

  /**
   * On an inbound stream opened.
   *
   * @protected
   * @param {Object} props
   * @param {string} props.protocol
   * @param {MuxedStream} props.stream
   * @param {Connection} props.connection - connection
   */
  _onIncomingStream ({ protocol, stream, connection }) {
    const peerId = connection.remotePeer
    const idB58Str = peerId.toB58String()
    const peer = this._addPeer(peerId, protocol)
    const inboundStream = peer.attachInboundStream(stream)

    this._processMessages(idB58Str, inboundStream, peer)
  }

  /**
   * Registrar notifies an established connection with pubsub protocol.
   *
   * @protected
   * @param {PeerId} peerId - remote peer-id
   * @param {Connection} conn - connection to the peer
   */
  async _onPeerConnected (peerId, conn) {
    const idB58Str = peerId.toB58String()
    this.log('connected', idB58Str)

    try {
      const { stream, protocol } = await conn.newStream(this.multicodecs)
      const peer = this._addPeer(peerId, protocol)
      await peer.attachOutboundStream(stream)
    } catch (err) {
      this.log.err(err)
    }

    // Immediately send my own subscriptions to the newly established conn
    this._sendSubscriptions(idB58Str, Array.from(this.subscriptions), true)
  }

  /**
   * Registrar notifies a closing connection with pubsub protocol.
   *
   * @protected
   * @param {PeerId} peerId - peerId
   * @param {Error} [err] - error for connection end
   */
  _onPeerDisconnected (peerId, err) {
    const idB58Str = peerId.toB58String()

    this.log('connection ended', idB58Str, err ? err.message : '')
    this._removePeer(peerId)
  }

  /**
   * Notifies the router that a peer has been connected
   *
   * @protected
   * @param {PeerId} peerId
   * @param {string} protocol
   * @returns {PeerStreams}
   */
  _addPeer (peerId, protocol) {
    const id = peerId.toB58String()
    const existing = this.peers.get(id)

    // If peer streams already exists, do nothing
    if (existing) {
      return existing
    }

    // else create a new peer streams
    this.log('new peer', id)

    const peerStreams = new PeerStreams({
      id: peerId,
      protocol
    })

    this.peers.set(id, peerStreams)
    peerStreams.once('close', () => this._removePeer(peerId))

    return peerStreams
  }

  /**
   * Notifies the router that a peer has been disconnected.
   *
   * @protected
   * @param {PeerId} peerId
   * @returns {PeerStreams | undefined}
   */
  _removePeer (peerId) {
    if (!peerId) return
    const id = peerId.toB58String()
    const peerStreams = this.peers.get(id)
    if (!peerStreams) return

    // close peer streams
    peerStreams.removeAllListeners()
    peerStreams.close()

    // delete peer streams
    this.log('delete peer', id)
    this.peers.delete(id)

    // remove peer from topics map
    for (const peers of this.topics.values()) {
      peers.delete(id)
    }

    return peerStreams
  }

  // MESSAGE METHODS

  /**
   * Responsible for processing each RPC message received by other peers.
   *
   * @param {string} idB58Str - peer id string in base58
   * @param {AsyncIterable<Uint8Array|BufferList>} stream - inbound stream
   * @param {PeerStreams} peerStreams - PubSub peer
   * @returns {Promise<void>}
   */
  async _processMessages (idB58Str, stream, peerStreams) {
    try {
      await pipe(
        stream,
        async (source) => {
          for await (const data of source) {
            const rpcBytes = data instanceof Uint8Array ? data : data.slice()
            const rpcMsg = this._decodeRpc(rpcBytes)

            this._processRpc(idB58Str, peerStreams, rpcMsg)
          }
        }
      )
    } catch (err) {
      this._onPeerDisconnected(peerStreams.id, err)
    }
  }

  /**
   * Handles an rpc request from a peer
   *
   * @param {string} idB58Str
   * @param {PeerStreams} peerStreams
   * @param {RPC} rpc
   * @returns {boolean}
   */
  _processRpc (idB58Str, peerStreams, rpc) {
    this.log('rpc from', idB58Str)
    const subs = rpc.subscriptions
    const msgs = rpc.msgs

    if (subs.length) {
      // update peer subscriptions
      subs.forEach((subOpt) => this._processRpcSubOpt(idB58Str, subOpt))
      this.emit('pubsub:subscription-change', peerStreams.id, subs)
    }

    if (!this._acceptFrom(idB58Str)) {
      this.log('received message from unacceptable peer %s', idB58Str)
      return false
    }

    if (msgs.length) {
      msgs.forEach(message => {
        if (!(this.canRelayMessage || message.topicIDs.some((topic) => this.subscriptions.has(topic)))) {
          this.log('received message we didn\'t subscribe to. Dropping.')
          return
        }
        const msg = utils.normalizeInRpcMessage(message, idB58Str)
        this._processRpcMessage(msg)
      })
    }
    return true
  }

  /**
   * Handles a subscription change from a peer
   *
   * @param {string} id
   * @param {RPCSubOpts} subOpt
   */
  _processRpcSubOpt (id, subOpt) {
    const t = subOpt.topicID

    let topicSet = this.topics.get(t)
    if (!topicSet) {
      topicSet = new Set()
      this.topics.set(t, topicSet)
    }

    if (subOpt.subscribe) {
      // subscribe peer to new topic
      topicSet.add(id)
    } else {
      // unsubscribe from existing topic
      topicSet.delete(id)
    }
  }

  /**
   * Handles an message from a peer
   *
   * @param {InMessage} msg
   * @returns {Promise<void>}
   */
  async _processRpcMessage (msg) {
    if (this.peerId.toB58String() === msg.from && !this.emitSelf) {
      return
    }

    // Ensure the message is valid before processing it
    try {
      await this.validate(msg)
    } catch (err) {
      this.log('Message is invalid, dropping it. %O', err)
      return
    }

    // Emit to self
    this._emitMessage(msg)

    this._publish(utils.normalizeOutRpcMessage(msg))
  }

  /**
   * Emit a message from a peer
   *
   * @param {InMessage} message
   */
  _emitMessage (message) {
    message.topicIDs.forEach((topic) => {
      if (this.subscriptions.has(topic)) {
        this.emit(topic, message)
      }
    })
  }

  /**
   * The default msgID implementation
   * Child class can override this.
   *
   * @param {RPCMessage} msg - the message object
   * @returns {Uint8Array} message id as bytes
   */
  getMsgId (msg) {
    const signaturePolicy = this.globalSignaturePolicy
    switch (signaturePolicy) {
      case SignaturePolicy.StrictSign:
        return utils.msgId(msg.from, msg.seqno)
      case SignaturePolicy.StrictNoSign:
        return utils.noSignMsgId(msg.data)
      default:
        throw errcode(new Error('Cannot get message id: unhandled signature policy: ' + signaturePolicy), codes.ERR_UNHANDLED_SIGNATURE_POLICY)
    }
  }

  /**
   * Whether to accept a message from a peer
   * Override to create a graylist
   *
   * @override
   * @param {string} id
   * @returns {boolean}
   */
  _acceptFrom (id) {
    return true
  }

  /**
   * Decode Uint8Array into an RPC object.
   * This can be override to use a custom router protobuf.
   *
   * @param {Uint8Array} bytes
   * @returns {RPC}
   */
  _decodeRpc (bytes) {
    return message.rpc.RPC.decode(bytes)
  }

  /**
   * Encode RPC object into a Uint8Array.
   * This can be override to use a custom router protobuf.
   *
   * @param {RPC} rpc
   * @returns {Uint8Array}
   */
  _encodeRpc (rpc) {
    return message.rpc.RPC.encode(rpc)
  }

  /**
   * Send an rpc object to a peer
   *
   * @param {string} id - peer id
   * @param {RPC} rpc
   * @returns {void}
   */
  _sendRpc (id, rpc) {
    const peerStreams = this.peers.get(id)
    if (!peerStreams || !peerStreams.isWritable) {
      const msg = `Cannot send RPC to ${id} as there is no open stream to it available`

      this.log.err(msg)
      return
    }
    peerStreams.write(this._encodeRpc(rpc))
  }

  /**
   * Send subscroptions to a peer
   *
   * @param {string} id - peer id
   * @param {string[]} topics
   * @param {boolean} subscribe - set to false for unsubscriptions
   * @returns {void}
   */
  _sendSubscriptions (id, topics, subscribe) {
    return this._sendRpc(id, {
      subscriptions: topics.map(t => ({ topicID: t, subscribe: subscribe }))
    })
  }

  /**
   * Validates the given message. The signature will be checked for authenticity.
   * Throws an error on invalid messages
   *
   * @param {InMessage} message
   * @returns {Promise<void>}
   */
  async validate (message) { // eslint-disable-line require-await
    const signaturePolicy = this.globalSignaturePolicy
    switch (signaturePolicy) {
      case SignaturePolicy.StrictNoSign:
        if (message.from) {
          throw errcode(new Error('StrictNoSigning: from should not be present'), codes.ERR_UNEXPECTED_FROM)
        }
        if (message.signature) {
          throw errcode(new Error('StrictNoSigning: signature should not be present'), codes.ERR_UNEXPECTED_SIGNATURE)
        }
        if (message.key) {
          throw errcode(new Error('StrictNoSigning: key should not be present'), codes.ERR_UNEXPECTED_KEY)
        }
        if (message.seqno) {
          throw errcode(new Error('StrictNoSigning: seqno should not be present'), codes.ERR_UNEXPECTED_SEQNO)
        }
        break
      case SignaturePolicy.StrictSign:
        if (!message.signature) {
          throw errcode(new Error('StrictSigning: Signing required and no signature was present'), codes.ERR_MISSING_SIGNATURE)
        }
        if (!message.seqno) {
          throw errcode(new Error('StrictSigning: Signing required and no seqno was present'), codes.ERR_MISSING_SEQNO)
        }
        if (!(await verifySignature(message))) {
          throw errcode(new Error('StrictSigning: Invalid message signature'), codes.ERR_INVALID_SIGNATURE)
        }
        break
      default:
        throw errcode(new Error('Cannot validate message: unhandled signature policy: ' + signaturePolicy), codes.ERR_UNHANDLED_SIGNATURE_POLICY)
    }
    for (const topic of message.topicIDs) {
      const validatorFn = this.topicValidators.get(topic)
      if (!validatorFn) {
        continue
      }
      await validatorFn(topic, message)
    }
  }

  /**
   * Normalizes the message and signs it, if signing is enabled.
   * Should be used by the routers to create the message to send.
   *
   * @protected
   * @param {RPCMessage} message
   * @returns {Promise<RPCMessage>}
   */
  _buildMessage (message) {
    const signaturePolicy = this.globalSignaturePolicy
    switch (signaturePolicy) {
      case SignaturePolicy.StrictSign:
        message.from = this.peerId.toB58String()
        message.seqno = utils.randomSeqno()
        return signMessage(this.peerId, utils.normalizeOutRpcMessage(message))
      case SignaturePolicy.StrictNoSign:
        return message
      default:
        throw errcode(new Error('Cannot build message: unhandled signature policy: ' + signaturePolicy), codes.ERR_UNHANDLED_SIGNATURE_POLICY)
    }
  }

  // API METHODS

  /**
   * Get a list of the peer-ids that are subscribed to one topic.
   *
   * @param {string} topic
   * @returns {Array<string>}
   */
  getSubscribers (topic) {
    if (!this.started) {
      throw errcode(new Error('not started yet'), 'ERR_NOT_STARTED_YET')
    }

    if (!topic || typeof topic !== 'string') {
      throw errcode(new Error('a string topic must be provided'), 'ERR_NOT_VALID_TOPIC')
    }

    const peersInTopic = this.topics.get(topic)
    if (!peersInTopic) {
      return []
    }
    return Array.from(peersInTopic)
  }

  /**
   * Publishes messages to all subscribed peers
   *
   * @override
   * @param {string} topic
   * @param {Uint8Array} message
   * @returns {Promise<void>}
   */
  async publish (topic, message) {
    if (!this.started) {
      throw new Error('Pubsub has not started')
    }

    this.log('publish', topic, message)

    const from = this.peerId.toB58String()
    let msgObject = {
      receivedFrom: from,
      data: message,
      topicIDs: [topic]
    }

    // ensure that the message follows the signature policy
    const outMsg = await this._buildMessage(msgObject)
    msgObject = utils.normalizeInRpcMessage(outMsg)

    // Emit to self if I'm interested and emitSelf enabled
    this.emitSelf && this._emitMessage(msgObject)

    // send to all the other peers
    await this._publish(msgObject)
  }

  /**
   * Overriding the implementation of publish should handle the appropriate algorithms for the publish/subscriber implementation.
   * For example, a Floodsub implementation might simply publish each message to each topic for every peer
   *
   * @abstract
   * @param {InMessage} message
   * @returns {Promise<void>}
   *
   */
  _publish (message) {
    throw errcode(new Error('publish must be implemented by the subclass'), 'ERR_NOT_IMPLEMENTED')
  }

  /**
   * Subscribes to a given topic.
   *
   * @abstract
   * @param {string} topic
   * @returns {void}
   */
  subscribe (topic) {
    if (!this.started) {
      throw new Error('Pubsub has not started')
    }

    if (!this.subscriptions.has(topic)) {
      this.subscriptions.add(topic)
      this.peers.forEach((_, id) => this._sendSubscriptions(id, [topic], true))
    }
  }

  /**
   * Unsubscribe from the given topic.
   *
   * @override
   * @param {string} topic
   * @returns {void}
   */
  unsubscribe (topic) {
    if (!this.started) {
      throw new Error('Pubsub is not started')
    }

    if (this.subscriptions.has(topic) && this.listenerCount(topic) === 0) {
      this.subscriptions.delete(topic)
      this.peers.forEach((_, id) => this._sendSubscriptions(id, [topic], false))
    }
  }

  /**
   * Get the list of topics which the peer is subscribed to.
   *
   * @override
   * @returns {Array<string>}
   */
  getTopics () {
    if (!this.started) {
      throw new Error('Pubsub is not started')
    }

    return Array.from(this.subscriptions)
  }
}

PubsubBaseProtocol.message = message
PubsubBaseProtocol.utils = utils
PubsubBaseProtocol.SignaturePolicy = SignaturePolicy

module.exports = PubsubBaseProtocol
