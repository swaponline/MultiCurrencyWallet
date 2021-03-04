'use strict'

/** @typedef {import('../types').EventEmitterFactory} Events */
/** @type Events */
const EventEmitter = require('events')

const lp = require('it-length-prefixed')

const pushable = require('it-pushable')
const { pipe } = require('it-pipe')
const { source: abortable } = require('abortable-iterator')
const AbortController = require('abort-controller').default
const debug = require('debug')

const log = debug('libp2p-pubsub:peer-streams')
log.error = debug('libp2p-pubsub:peer-streams:error')

/**
 * @typedef {import('../stream-muxer/types').MuxedStream} MuxedStream
 * @typedef {import('peer-id')} PeerId
 * @typedef {import('it-pushable').Pushable<Uint8Array>} PushableStream
 */

/**
 * Thin wrapper around a peer's inbound / outbound pubsub streams
 */
class PeerStreams extends EventEmitter {
  /**
   * @param {object} properties - properties of the PeerStreams.
   * @param {PeerId} properties.id
   * @param {string} properties.protocol
   */
  constructor ({ id, protocol }) {
    super()

    /**
     * @type {import('peer-id')}
     */
    this.id = id
    /**
     * Established protocol
     *
     * @type {string}
     */
    this.protocol = protocol
    /**
     * The raw outbound stream, as retrieved from conn.newStream
     *
     * @private
     * @type {null|MuxedStream}
     */
    this._rawOutboundStream = null
    /**
     * The raw inbound stream, as retrieved from the callback from libp2p.handle
     *
     * @private
     * @type {null|MuxedStream}
     */
    this._rawInboundStream = null
    /**
     * An AbortController for controlled shutdown of the inbound stream
     *
     * @private
     * @type {AbortController}
     */
    this._inboundAbortController = new AbortController()
    /**
     * Write stream -- its preferable to use the write method
     *
     * @type {null|PushableStream}
     */
    this.outboundStream = null
    /**
     * Read stream
     *
     * @type {null| AsyncIterable<Uint8Array>}
     */
    this.inboundStream = null
  }

  /**
   * Do we have a connection to read from?
   *
   * @type {boolean}
   */
  get isReadable () {
    return Boolean(this.inboundStream)
  }

  /**
   * Do we have a connection to write on?
   *
   * @type {boolean}
   */
  get isWritable () {
    return Boolean(this.outboundStream)
  }

  /**
   * Send a message to this peer.
   * Throws if there is no `stream` to write to available.
   *
   * @param {Uint8Array} data
   * @returns {void}
   */
  write (data) {
    if (!this.outboundStream) {
      const id = this.id.toB58String()
      throw new Error('No writable connection to ' + id)
    }

    this.outboundStream.push(data)
  }

  /**
   * Attach a raw inbound stream and setup a read stream
   *
   * @param {MuxedStream} stream
   * @returns {AsyncIterable<Uint8Array>}
   */
  attachInboundStream (stream) {
    // Create and attach a new inbound stream
    // The inbound stream is:
    // - abortable, set to only return on abort, rather than throw
    // - transformed with length-prefix transform
    this._rawInboundStream = stream
    this.inboundStream = abortable(
      pipe(
        this._rawInboundStream,
        lp.decode()
      ),
      this._inboundAbortController.signal,
      { returnOnAbort: true }
    )

    this.emit('stream:inbound')
    return this.inboundStream
  }

  /**
   * Attach a raw outbound stream and setup a write stream
   *
   * @param {MuxedStream} stream
   * @returns {Promise<void>}
   */
  async attachOutboundStream (stream) {
    // If an outbound stream already exists, gently close it
    const _prevStream = this.outboundStream
    if (this.outboundStream) {
      // End the stream without emitting a close event
      await this.outboundStream.end()
    }

    this._rawOutboundStream = stream
    this.outboundStream = pushable({
      onEnd: (shouldEmit) => {
        // close writable side of the stream
        this._rawOutboundStream && this._rawOutboundStream.reset && this._rawOutboundStream.reset()
        this._rawOutboundStream = null
        this.outboundStream = null
        if (shouldEmit) {
          this.emit('close')
        }
      }
    })

    pipe(
      this.outboundStream,
      lp.encode(),
      this._rawOutboundStream
    ).catch(err => {
      log.error(err)
    })

    // Only emit if the connection is new
    if (!_prevStream) {
      this.emit('stream:outbound')
    }
  }

  /**
   * Closes the open connection to peer
   *
   * @returns {void}
   */
  close () {
    // End the outbound stream
    if (this.outboundStream) {
      this.outboundStream.end()
    }
    // End the inbound stream
    if (this.inboundStream) {
      this._inboundAbortController.abort()
    }

    this._rawOutboundStream = null
    this.outboundStream = null
    this._rawInboundStream = null
    this.inboundStream = null
    this.emit('close')
  }
}

module.exports = PeerStreams
