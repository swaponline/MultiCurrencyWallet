const dgram = require('dgram')
const os = require('os')
const EventEmitter = require('events').EventEmitter

const MULTICAST_IP_ADDRESS = '239.255.255.250'
const MULTICAST_PORT = 1900

class Ssdp extends EventEmitter {
  constructor (opts) {
    super()

    opts = opts || {}

    this.multicast = MULTICAST_IP_ADDRESS
    this.port = MULTICAST_PORT

    this._destroyed = false
    this._sourcePort = opts.sourcePort || 0
    this._bound = false
    this._boundCount = 0
    this._destroyed = false
    this._queue = []

    // Create sockets on all external interfaces
    this.createSockets()
  }

  createSockets () {
    if (this._destroyed) throw new Error('client is destroyed')

    const self = this
    const interfaces = os.networkInterfaces()

    this.sockets = []
    for (const key in interfaces) {
      interfaces[key].filter(function (item) {
        return !item.internal
      }).forEach(function (item) {
        self.createSocket(item)
      })
    }
  }

  search (device, promise) {
    if (this._destroyed) throw new Error('client is destroyed')

    if (!promise) {
      promise = new EventEmitter()
      promise._ended = false
      promise.once('end', function () {
        promise._ended = true
      })
    }

    if (!this._bound) {
      this._queue.push({ action: 'search', device: device, promise: promise })
      return promise
    }

    // If promise was ended before binding - do not send queries
    if (promise._ended) return

    const self = this
    const query = Buffer.from(
      'M-SEARCH * HTTP/1.1\r\n' +
      'HOST: ' + this.multicast + ':' + this.port + '\r\n' +
      'MAN: "ssdp:discover"\r\n' +
      'MX: 1\r\n' +
      'ST: ' + device + '\r\n' +
      '\r\n'
    )

    // Send query on each socket
    this.sockets.forEach(function (socket) {
      socket.send(query, 0, query.length, self.port, self.multicast)
    })

    function onDevice (info, address) {
      if (promise._ended) return
      if (info.st !== device) return

      promise.emit('device', info, address)
    }
    this.on('_device', onDevice)

    // Detach listener after receiving 'end' event
    promise.once('end', function () {
      self.removeListener('_device', onDevice)
    })

    return promise
  }

  createSocket (interf) {
    if (this._destroyed) throw new Error('client is destroyed')

    const self = this
    let socket = dgram.createSocket(interf.family === 'IPv4' ? 'udp4' : 'udp6')

    socket.on('message', function (message, info) {
      // Ignore messages after closing sockets
      if (self._destroyed) return

      // Parse response
      self._parseResponse(message.toString(), socket.address, info)
    })

    // Unqueue this._queue once all sockets are ready
    function onReady () {
      if (self._boundCount < self.sockets.length) return

      self._bound = true
      self._queue.forEach(function (item) {
        return self[item.action](item.device, item.promise)
      })
    }

    socket.on('listening', function () {
      self._boundCount += 1
      onReady()
    })

    function onClose () {
      if (socket) {
        const index = self.sockets.indexOf(socket)
        self.sockets.splice(index, 1)
        socket = null
      }
    }

    // On error - remove socket from list and execute items from queue
    socket.on('close', () => {
      onClose()
    })
    socket.on('error', () => {
      // Ignore errors

      if (socket) {
        socket.close()
        // Force trigger onClose() - 'close()' does not guarantee to emit 'close'
        onClose()
      }

      onReady()
    })

    socket.address = interf.address
    socket.bind(self._sourcePort, interf.address)

    this.sockets.push(socket)
  }

  // TODO create separate logic for parsing unsolicited upnp broadcasts,
  // if and when that need arises
  _parseResponse (response, addr, remote) {
    if (this._destroyed) return

    const self = this

    // Ignore incorrect packets
    if (!/^(HTTP|NOTIFY)/m.test(response)) return

    const headers = self._parseMimeHeader(response)

    // Messages that match the original search target
    if (!headers.st) return

    this.emit('_device', headers, addr)
  }

  _parseMimeHeader (headerStr) {
    if (this._destroyed) return

    const lines = headerStr.split(/\r\n/g)

    // Parse headers from lines to hashmap
    return lines.reduce(function (headers, line) {
      line.replace(/^([^:]*)\s*:\s*(.*)$/, function (a, key, value) {
        headers[key.toLowerCase()] = value
      })
      return headers
    }, {})
  }

  destroy () {
    this._destroyed = true

    while (this.sockets.length > 0) {
      const socket = this.sockets.shift()
      socket.close()
    }
  }
}

module.exports = Ssdp
