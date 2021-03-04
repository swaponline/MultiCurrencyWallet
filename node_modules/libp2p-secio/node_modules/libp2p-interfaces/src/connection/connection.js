'use strict'

const PeerId = require('peer-id')
const multiaddr = require('multiaddr')
const withIs = require('class-is')
const errCode = require('err-code')
const Status = require('./status')

function validateArgs (localAddr, localPeer, remotePeer, newStream, close, getStreams, stat) {
  if (localAddr && !multiaddr.isMultiaddr(localAddr)) {
    throw errCode(new Error('localAddr must be an instance of multiaddr'), 'ERR_INVALID_PARAMETERS')
  }

  if (!PeerId.isPeerId(localPeer)) {
    throw errCode(new Error('localPeer must be an instance of peer-id'), 'ERR_INVALID_PARAMETERS')
  }

  if (!PeerId.isPeerId(remotePeer)) {
    throw errCode(new Error('remotePeer must be an instance of peer-id'), 'ERR_INVALID_PARAMETERS')
  }

  if (typeof newStream !== 'function') {
    throw errCode(new Error('new stream must be a function'), 'ERR_INVALID_PARAMETERS')
  }

  if (typeof close !== 'function') {
    throw errCode(new Error('close must be a function'), 'ERR_INVALID_PARAMETERS')
  }

  if (typeof getStreams !== 'function') {
    throw errCode(new Error('getStreams must be a function'), 'ERR_INVALID_PARAMETERS')
  }

  if (!stat) {
    throw errCode(new Error('connection metadata object must be provided'), 'ERR_INVALID_PARAMETERS')
  }

  if (stat.direction !== 'inbound' && stat.direction !== 'outbound') {
    throw errCode(new Error('direction must be "inbound" or "outbound"'), 'ERR_INVALID_PARAMETERS')
  }

  if (!stat.timeline) {
    throw errCode(new Error('connection timeline object must be provided in the stat object'), 'ERR_INVALID_PARAMETERS')
  }

  if (!stat.timeline.open) {
    throw errCode(new Error('connection open timestamp must be provided'), 'ERR_INVALID_PARAMETERS')
  }

  if (!stat.timeline.upgraded) {
    throw errCode(new Error('connection upgraded timestamp must be provided'), 'ERR_INVALID_PARAMETERS')
  }
}

/**
 * An implementation of the js-libp2p connection.
 * Any libp2p transport should use an upgrader to return this connection.
 */
class Connection {
  /**
   * Creates an instance of Connection.
   * @param {object} properties properties of the connection.
   * @param {multiaddr} [properties.localAddr] local multiaddr of the connection if known.
   * @param {multiaddr} [properties.remoteAddr] remote multiaddr of the connection.
   * @param {PeerId} properties.localPeer local peer-id.
   * @param {PeerId} properties.remotePeer remote peer-id.
   * @param {function} properties.newStream new stream muxer function.
   * @param {function} properties.close close raw connection function.
   * @param {function} properties.getStreams get streams from muxer function.
   * @param {object} properties.stat metadata of the connection.
   * @param {string} properties.stat.direction connection establishment direction ("inbound" or "outbound").
   * @param {object} properties.stat.timeline connection relevant events timestamp.
   * @param {string} properties.stat.timeline.open connection opening timestamp.
   * @param {string} properties.stat.timeline.upgraded connection upgraded timestamp.
   * @param {string} [properties.stat.multiplexer] connection multiplexing identifier.
   * @param {string} [properties.stat.encryption] connection encryption method identifier.
   */
  constructor ({ localAddr, remoteAddr, localPeer, remotePeer, newStream, close, getStreams, stat }) {
    validateArgs(localAddr, localPeer, remotePeer, newStream, close, getStreams, stat)

    /**
     * Connection identifier.
     */
    this.id = (parseInt(Math.random() * 1e9)).toString(36) + Date.now()

    /**
     * Observed multiaddr of the local peer
     */
    this.localAddr = localAddr

    /**
     * Observed multiaddr of the remote peer
     */
    this.remoteAddr = remoteAddr

    /**
     * Local peer id.
     */
    this.localPeer = localPeer

    /**
     * Remote peer id.
     */
    this.remotePeer = remotePeer

    /**
     * Connection metadata.
     */
    this._stat = {
      ...stat,
      status: Status.OPEN
    }

    /**
     * Reference to the new stream function of the multiplexer
     */
    this._newStream = newStream

    /**
     * Reference to the close function of the raw connection
     */
    this._close = close

    /**
     * Reference to the getStreams function of the muxer
     */
    this._getStreams = getStreams

    /**
     * Connection streams registry
     */
    this.registry = new Map()

    /**
     * User provided tags
     */
    this.tags = []
  }

  /**
   * Get connection metadata
   * @return {Object}
   */
  get stat () {
    return this._stat
  }

  /**
   * Get all the streams of the muxer.
   * @return {Array<*>}
   */
  get streams () {
    return this._getStreams()
  }

  /**
   * Create a new stream from this connection
   * @param {string[]} protocols intended protocol for the stream
   * @return {Promise<object>} with muxed+multistream-selected stream and selected protocol
   */
  async newStream (protocols) {
    if (this.stat.status === Status.CLOSING) {
      throw errCode(new Error('the connection is being closed'), 'ERR_CONNECTION_BEING_CLOSED')
    }

    if (this.stat.status === Status.CLOSED) {
      throw errCode(new Error('the connection is closed'), 'ERR_CONNECTION_CLOSED')
    }

    if (!Array.isArray(protocols)) protocols = [protocols]

    const { stream, protocol } = await this._newStream(protocols)

    this.addStream(stream, { protocol })

    return {
      stream,
      protocol
    }
  }

  /**
   * Add a stream when it is opened to the registry.
   * @param {*} muxedStream a muxed stream
   * @param {object} properties the stream properties to be registered
   * @param {string} properties.protocol the protocol used by the stream
   * @param {object} properties.metadata metadata of the stream
   * @return {void}
   */
  addStream (muxedStream, { protocol, metadata = {} }) {
    // Add metadata for the stream
    this.registry.set(muxedStream.id, {
      protocol,
      ...metadata
    })
  }

  /**
   * Remove stream registry after it is closed.
   * @param {string} id identifier of the stream
   */
  removeStream (id) {
    this.registry.delete(id)
  }

  /**
   * Close the connection.
   * @return {Promise}
   */
  async close () {
    if (this.stat.status === Status.CLOSED) {
      return
    }

    if (this._closing) {
      return this._closing
    }

    this.stat.status = Status.CLOSING

    // Close raw connection
    this._closing = await this._close()

    this._stat.timeline.close = Date.now()
    this.stat.status = Status.CLOSED
  }
}

module.exports = withIs(Connection, { className: 'Connection', symbolName: '@libp2p/interface-connection/connection' })
