'use strict'

const abortable = require('abortable-iterator')
const toIterable = require('stream-to-it')
const { CLOSE_TIMEOUT } = require('./constants')
const toMultiaddr = require('libp2p-utils/src/ip-port-to-multiaddr')

const debug = require('debug')
const log = debug('libp2p:webrtc-star:socket')
log.error = debug('libp2p:webrtc-star:socket:error')

const toWebrtcMultiaddr = (address, port) => {
  if (!address || !port) return undefined

  try {
    return toMultiaddr(address, port)
  } catch (err) {
    log.error(err)
    // Account for mdns hostnames, just make it a local ip for now
    return toMultiaddr('0.0.0.0', port)
  }
}

// Convert a socket into a MultiaddrConnection
// https://github.com/libp2p/js-libp2p-interfaces/tree/master/src/transport#multiaddrconnection
module.exports = (socket, options = {}) => {
  const { sink, source } = toIterable.duplex(socket)

  // If the remote address was passed, use it - it may have the peer ID encapsulated
  const remoteAddr = options.remoteAddr || toWebrtcMultiaddr(socket.remoteAddress, socket.remotePort)
  const localAddr = toWebrtcMultiaddr(socket.localAddress, socket.localPort)

  const maConn = {
    async sink (source) {
      if (options.signal) {
        source = abortable(source, options.signal)
      }

      try {
        await sink((async function * () {
          for await (const chunk of source) {
            // Convert BufferList to Buffer
            yield chunk instanceof Uint8Array ? chunk : chunk.slice()
          }
        })())
      } catch (err) {
        // If aborted we can safely ignore
        if (err.type !== 'aborted') {
          // If the source errored the socket will already have been destroyed by
          // toIterable.duplex(). If the socket errored it will already be
          // destroyed. There's nothing to do here except log the error & return.
          log.error(err)
        }
      }
    },

    source: options.signal ? abortable(source, options.signal) : source,

    conn: socket,

    localAddr,
    remoteAddr,

    timeline: { open: Date.now() },

    close () {
      if (socket.destroyed) return

      return new Promise((resolve, reject) => {
        const start = Date.now()

        // Attempt to end the socket. If it takes longer to close than the
        // timeout, destroy it manually.
        const timeout = setTimeout(() => {
          if (maConn.remoteAddr) {
            const { host, port } = maConn.remoteAddr.toOptions()
            log('timeout closing socket to %s:%s after %dms, destroying it manually',
              host, port, Date.now() - start)
          }

          if (!socket.destroyed) {
            socket.destroy()
          }
        }, CLOSE_TIMEOUT)

        socket.once('close', () => {
          resolve()
        })

        socket.end(err => {
          clearTimeout(timeout)

          maConn.timeline.close = Date.now()
          if (err) return reject(err)
        })
      })
    }
  }

  socket.once('close', () => {
    // In instances where `close` was not explicitly called,
    // such as an iterable stream ending, ensure we have set the close
    // timeline
    if (!maConn.timeline.close) {
      maConn.timeline.close = Date.now()
    }
  })

  return maConn
}
