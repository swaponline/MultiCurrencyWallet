const async = require('async')

const Device = require('./device')
const Ssdp = require('./ssdp')

class Client {
  constructor (opts) {
    this.ssdp = new Ssdp()
    this.timeout = 1800

    this._destroyed = false
  }

  static createClient () {
    return new Client()
  }

  portMapping (options, callback) {
    const self = this
    if (self._destroyed) throw new Error('client is destroyed')
    if (!callback) callback = noop

    this.findGateway(function (err, gateway, address) {
      if (err) return callback(err)

      const ports = self._normalizeOptions(options)
      const description = options.description || 'node:nat:upnp'
      const protocol = options.protocol ? options.protocol.toUpperCase() : 'TCP'
      var ttl = 60 * 30

      if (typeof options.ttl === 'number') ttl = options.ttl
      if (typeof options.ttl === 'string' && !isNaN(options.ttl)) ttl = Number(options.ttl)

      gateway.run('AddPortMapping', [
        ['NewRemoteHost', ports.remote.host],
        ['NewExternalPort', ports.remote.port],
        ['NewProtocol', protocol],
        ['NewInternalPort', ports.internal.port],
        ['NewInternalClient', ports.internal.host || address],
        ['NewEnabled', 1],
        ['NewPortMappingDescription', description],
        ['NewLeaseDuration', ttl]
      ], callback)
    })
  }

  portUnmapping (options, callback) {
    const self = this
    if (self._destroyed) throw new Error('client is destroyed')
    if (!callback) callback = noop

    this.findGateway(function (err, gateway/* , address */) {
      if (err) return callback(err)

      const ports = self._normalizeOptions(options)
      const protocol = options.protocol ? options.protocol.toUpperCase() : 'TCP'

      gateway.run('DeletePortMapping', [
        ['NewRemoteHost', ports.remote.host],
        ['NewExternalPort', ports.remote.port],
        ['NewProtocol', protocol]
      ], callback)
    })
  }

  getMappings (options, callback) {
    const self = this
    if (self._destroyed) throw new Error('client is destroyed')

    if (typeof options === 'function') {
      callback = options
      options = null
    }
    if (!options) options = {}
    if (!callback) callback = noop

    this.findGateway(function (err, gateway, address) {
      if (err) return callback(err)

      var i = 0
      var end = false
      var results = []

      async.whilst(function () {
        return !end
      }, function (callback) {
        gateway.run('GetGenericPortMappingEntry', [
          ['NewPortMappingIndex', i++]
        ], (err, data) => {
          if (err) {
            // If we got an error on index 0, ignore it in case this router starts indicies on 1
            if (i !== 1) end = true
            return callback(null)
          }

          let key = null
          Object.keys(data).some(function (k) {
            if (!/:GetGenericPortMappingEntryResponse/.test(k)) return false

            key = k
            return true
          })

          if (!key) return callback(Error('Incorrect response'))

          data = data[key]

          var result = {
            public: {
              host: (typeof data.NewRemoteHost === 'string') && (data.NewRemoteHost || ''),
              port: parseInt(data.NewExternalPort, 10)
            },
            private: {
              host: data.NewInternalClient,
              port: parseInt(data.NewInternalPort, 10)
            },
            protocol: data.NewProtocol.toLowerCase(),
            enabled: data.NewEnabled === '1',
            description: data.NewPortMappingDescription,
            ttl: parseInt(data.NewLeaseDuration, 10)
          }
          result.local = (result.private.host === address)

          results.push(result)

          callback(null)
        })
      }, (err) => {
        if (err) return callback(err)

        if (options.local) {
          results = results.filter((item) => {
            return item.local
          })
        }

        if (options.description) {
          results = results.filter((item) => {
            if (typeof item.description !== 'string') return false

            if (options.description instanceof RegExp) {
              return item.description.match(options.description) !== null
            } else {
              return item.description.indexOf(options.description) !== -1
            }
          })
        }

        callback(null, results)
      })
    })
  }

  externalIp (callback) {
    const self = this
    if (self._destroyed) throw new Error('client is destroyed')
    if (!callback) callback = noop

    this.findGateway(function (err, gateway/* , address */) {
      if (err) return callback(err)

      gateway.run('GetExternalIPAddress', [], function (err, data) {
        if (err) return callback(err)

        let key = null
        Object.keys(data).some(function (k) {
          if (!/:GetExternalIPAddressResponse$/.test(k)) return false

          key = k
          return true
        })

        if (!key) return callback(Error('Incorrect response'))

        callback(null, data[key].NewExternalIPAddress)
      })
    })
  }

  findGateway (callback) {
    const self = this
    if (self._destroyed) throw new Error('client is destroyed')
    if (!callback) callback = noop

    let timeouted = false
    const p = this.ssdp.search(
      'urn:schemas-upnp-org:device:InternetGatewayDevice:1'
    )

    const timeout = setTimeout(function () {
      timeouted = true
      p.emit('end')
      callback(new Error('timeout'))
    }, this.timeout)

    p.on('device', function (info, address) {
      if (timeouted) return
      clearTimeout(timeout)
      p.emit('end')

      // Create gateway
      callback(null, new Device(info.location), address)
    })
  }

  destroy () {
    this._destroyed = true

    this.ssdp.destroy()
  }

  _normalizeOptions (options) {
    function toObject (addr) {
      if (typeof addr === 'number') return { port: addr }
      if (typeof addr === 'string' && !isNaN(addr)) return { port: Number(addr) }
      if (typeof addr === 'object') return addr

      return {}
    }

    return {
      remote: toObject(options.public),
      internal: toObject(options.private)
    }
  }
}

function noop () {}

module.exports = Client
