'use strict'

const noop = () => {}
const topologySymbol = Symbol.for('@libp2p/js-interfaces/topology')

/**
 * @typedef {import('peer-id')} PeerId
 */

/**
 * @typedef {Object} Options
 * @property {number} [min=0] - minimum needed connections.
 * @property {number} [max=Infinity] - maximum needed connections.
 * @property {Handlers} [handlers]
 *
 * @typedef {Object} Handlers
 * @property {(peerId: PeerId, conn: Connection) => void} [onConnect] - protocol "onConnect" handler
 * @property {(peerId: PeerId, error?:Error) => void} [onDisconnect] - protocol "onDisconnect" handler
 *
 * @typedef {import('../connection/connection')} Connection
 */

class Topology {
  /**
   * @param {Options} options
   */
  constructor ({
    min = 0,
    max = Infinity,
    handlers = {}
  }) {
    this.min = min
    this.max = max

    // Handlers
    this._onConnect = handlers.onConnect || noop
    this._onDisconnect = handlers.onDisconnect || noop

    /**
     * Set of peers that support the protocol.
     *
     * @type {Set<string>}
     */
    this.peers = new Set()
  }

  get [Symbol.toStringTag] () {
    return 'Topology'
  }

  get [topologySymbol] () {
    return true
  }

  /**
   * Checks if the given value is a Topology instance.
   *
   * @param {any} other
   * @returns {other is Topology}
   */
  static isTopology (other) {
    return Boolean(other && other[topologySymbol])
  }

  set registrar (registrar) { // eslint-disable-line
    this._registrar = registrar
  }

  /**
   * Notify about peer disconnected event.
   *
   * @param {PeerId} peerId
   * @returns {void}
   */
  disconnect (peerId) {
    this._onDisconnect(peerId)
  }
}

module.exports = Topology
