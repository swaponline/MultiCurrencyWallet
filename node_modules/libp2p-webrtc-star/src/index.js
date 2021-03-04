'use strict'

const debug = require('debug')
const log = debug('libp2p:webrtc-star')
log.error = debug('libp2p:webrtc-star:error')

const { EventEmitter } = require('events')
const errcode = require('err-code')
const withIs = require('class-is')

const { AbortError } = require('abortable-iterator')
const SimplePeer = require('libp2p-webrtc-peer')
const { supportsWebRTCDataChannels: webrtcSupport } = require('ipfs-utils/src/supports')

const multiaddr = require('multiaddr')
const mafmt = require('mafmt')
const PeerId = require('peer-id')

const { CODE_CIRCUIT } = require('./constants')
const createListener = require('./listener')
const toConnection = require('./socket-to-conn')
const { cleanMultiaddr } = require('./utils')

function noop () { }

/**
 * @class WebRTCStar
 */
class WebRTCStar {
  /**
   * @class
   * @param {object} options
   * @param {Upgrader} options.upgrader
   */
  constructor (options = {}) {
    if (!options.upgrader) {
      throw new Error('An upgrader must be provided. See https://github.com/libp2p/interface-transport#upgrader.')
    }

    this._upgrader = options.upgrader

    this._signallingAddr = undefined

    this.sioOptions = {
      transports: ['websocket'],
      'force new connection': true
    }

    if (options.wrtc) {
      this.wrtc = options.wrtc
    }

    this.listenersRefs = {}

    // Discovery
    this.discovery = new EventEmitter()
    this.discovery.tag = 'webRTCStar'
    this.discovery._isStarted = false
    this.discovery.start = () => {
      this.discovery._isStarted = true
    }
    this.discovery.stop = () => {
      this.discovery._isStarted = false
    }
    this._peerDiscovered = this._peerDiscovered.bind(this)
  }

  /**
   * @async
   * @param {Multiaddr} ma
   * @param {object} options
   * @param {AbortSignal} options.signal - Used to abort dial requests
   * @returns {Connection} An upgraded Connection
   */
  async dial (ma, options = {}) {
    const rawConn = await this._connect(ma, options)
    const maConn = toConnection(rawConn, { remoteAddr: ma, signal: options.signal })
    log('new outbound connection %s', maConn.remoteAddr)
    const conn = await this._upgrader.upgradeOutbound(maConn)
    log('outbound connection %s upgraded', maConn.remoteAddr)
    return conn
  }

  /**
   * @private
   * @param {Multiaddr} ma
   * @param {object} options
   * @param {AbortSignal} options.signal - Used to abort dial requests
   * @returns {Promise<SimplePeer>} Resolves a SimplePeer Webrtc channel
   */
  _connect (ma, options = {}) {
    if (options.signal && options.signal.aborted) {
      throw new AbortError()
    }

    const spOptions = {
      initiator: true,
      trickle: false,
      ...options.spOptions || {}
    }

    // Use custom WebRTC implementation
    if (this.wrtc) { spOptions.wrtc = this.wrtc }

    const cOpts = ma.toOptions()

    const intentId = (~~(Math.random() * 1e9)).toString(36) + Date.now()
    const sioClient = this
      .listenersRefs[Object.keys(this.listenersRefs)[0]].io

    return new Promise((resolve, reject) => {
      const start = Date.now()
      let connected

      log('dialing %s:%s', cOpts.host, cOpts.port)
      const channel = new SimplePeer(spOptions)

      const onError = (err) => {
        if (!connected) {
          const msg = `connection error ${cOpts.host}:${cOpts.port}: ${err.message}`
          log.error(msg)
          done(err)
        }
      }

      const onTimeout = () => {
        log('connnection timeout %s:%s', cOpts.host, cOpts.port)
        const err = errcode(new Error(`connection timeout after ${Date.now() - start}ms`), 'ERR_CONNECT_TIMEOUT')
        // Note: this will result in onError() being called
        channel.emit('error', err)
      }

      const onConnect = () => {
        connected = true

        log('connection opened %s:%s', cOpts.host, cOpts.port)
        done(null)
      }

      const onAbort = () => {
        log.error('connection aborted %s:%s', cOpts.host, cOpts.port)
        channel.destroy()
        done(new AbortError())
      }

      const done = (err) => {
        channel.removeListener('timeout', onTimeout)
        channel.removeListener('connect', onConnect)
        options.signal && options.signal.removeEventListener('abort', onAbort)

        err ? reject(err) : resolve(channel)
      }

      channel.on('error', onError)
      channel.once('timeout', onTimeout)
      channel.once('connect', onConnect)
      channel.on('close', () => {
        channel.removeListener('error', onError)
      })
      options.signal && options.signal.addEventListener('abort', onAbort)

      channel.on('signal', (signal) => {
        sioClient.emit('ss-handshake', {
          intentId: intentId,
          srcMultiaddr: this._signallingAddr.toString(),
          dstMultiaddr: ma.toString(),
          signal: signal
        })
      })

      // NOTE: aegir segfaults if we do .once on the socket.io event emitter and we
      // are clueless as to why.
      sioClient.on('ws-handshake', (offer) => {
        if (offer.intentId === intentId && offer.err) {
          reject(errcode(offer.err instanceof Error ? offer.err : new Error(offer.err), 'ERR_SIGNALLING_FAILED'))
        }

        if (offer.intentId !== intentId || !offer.answer || channel.destroyed) {
          return
        }

        channel.signal(offer.signal)
      })
    })
  }

  /**
   * Creates a WebrtcStar listener. The provided `handler` function will be called
   * anytime a new incoming Connection has been successfully upgraded via
   * `upgrader.upgradeInbound`.
   *
   * @param {object} [options] - simple-peer options for listener
   * @param {function (Connection)} handler
   * @returns {Listener} A WebrtcStar listener
   */
  createListener (options = {}, handler) {
    if (!webrtcSupport && !this.wrtc) {
      throw errcode(new Error('no WebRTC support'), 'ERR_NO_WEBRTC_SUPPORT')
    }

    if (typeof options === 'function') {
      handler = options
      options = {}
    }

    handler = handler || noop

    return createListener({ handler, upgrader: this._upgrader }, this, options)
  }

  /**
   * Takes a list of `Multiaddr`s and returns only valid TCP addresses
   *
   * @param {Multiaddr[]} multiaddrs
   * @returns {Multiaddr[]} Valid TCP multiaddrs
   */
  filter (multiaddrs) {
    multiaddrs = Array.isArray(multiaddrs) ? multiaddrs : [multiaddrs]

    return multiaddrs.filter((ma) => {
      if (ma.protoCodes().includes(CODE_CIRCUIT)) {
        return false
      }

      return mafmt.WebRTCStar.matches(ma)
    })
  }

  _peerDiscovered (maStr) {
    if (!this.discovery._isStarted) return

    log('Peer Discovered:', maStr)
    maStr = cleanMultiaddr(maStr)

    const ma = multiaddr(maStr)
    const peerId = PeerId.createFromB58String(ma.getPeerId())

    this.discovery.emit('peer', {
      id: peerId,
      multiaddrs: [ma]
    })
  }
}

module.exports = withIs(WebRTCStar, { className: 'WebRTCStar', symbolName: '@libp2p/js-libp2p-webrtc-star/webrtcstar' })
