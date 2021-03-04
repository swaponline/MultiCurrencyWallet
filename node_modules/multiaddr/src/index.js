'use strict'

const codec = require('./codec')
const protocols = require('./protocols-table')
const varint = require('varint')
const CID = require('cids')
const withIs = require('class-is')
const errCode = require('err-code')
const inspect = Symbol.for('nodejs.util.inspect.custom')
const uint8ArrayToString = require('uint8arrays/to-string')
const uint8ArrayEquals = require('uint8arrays/equals')

const resolvers = new Map()

/**
 * Creates a [multiaddr](https://github.com/multiformats/multiaddr) from
 * a Uint8Array, String or another Multiaddr instance
 * public key.
 *
 * @class Multiaddr
 * @param {(string | Uint8Array | Multiaddr)} addr - If String or Uint8Array, needs to adhere
 * to the address format of a [multiaddr](https://github.com/multiformats/multiaddr#string-format)
 * @example
 * Multiaddr('/ip4/127.0.0.1/tcp/4001')
 * // <Multiaddr 047f000001060fa1 - /ip4/127.0.0.1/tcp/4001>
 */
const Multiaddr = withIs.proto(function (addr) {
  if (!(this instanceof Multiaddr)) {
    return new Multiaddr(addr)
  }

  // default
  if (addr == null) {
    addr = ''
  }

  if (addr instanceof Uint8Array) {
    /**
     * @type {Uint8Array} - The raw bytes representing this multiaddress
     */
    this.bytes = codec.fromBytes(addr)
  } else if (typeof addr === 'string' || addr instanceof String) {
    if (addr.length > 0 && addr.charAt(0) !== '/') {
      throw new Error(`multiaddr "${addr}" must start with a "/"`)
    }
    this.bytes = codec.fromString(addr)
  } else if (addr.bytes && addr.protos && addr.protoCodes) { // Multiaddr
    this.bytes = codec.fromBytes(addr.bytes) // validate + copy buffer
  } else {
    throw new Error('addr must be a string, Buffer, or another Multiaddr')
  }
}, { className: 'Multiaddr', symbolName: '@multiformats/js-multiaddr/multiaddr' })

/**
 * Returns Multiaddr as a String
 *
 * @returns {string}
 * @example
 * Multiaddr('/ip4/127.0.0.1/tcp/4001').toString()
 * // '/ip4/127.0.0.1/tcp/4001'
 */
Multiaddr.prototype.toString = function toString () {
  return codec.bytesToString(this.bytes)
}

/**
 * Returns Multiaddr as a JSON encoded object
 *
 * @returns {string}
 * @example
 * JSON.stringify(Multiaddr('/ip4/127.0.0.1/tcp/4001'))
 * // '/ip4/127.0.0.1/tcp/4001'
 */
Multiaddr.prototype.toJSON = Multiaddr.prototype.toString

/**
 * Returns Multiaddr as a convinient options object to be used with net.createConnection
 *
 * @returns {{family: string, host: string, transport: string, port: number}}
 * @example
 * Multiaddr('/ip4/127.0.0.1/tcp/4001').toOptions()
 * // { family: 'ipv4', host: '127.0.0.1', transport: 'tcp', port: 4001 }
 */
Multiaddr.prototype.toOptions = function toOptions () {
  const opts = {}
  const parsed = this.toString().split('/')
  opts.family = parsed[1] === 'ip4' ? 'ipv4' : 'ipv6'
  opts.host = parsed[2]
  opts.transport = parsed[3]
  opts.port = parseInt(parsed[4])
  return opts
}

/**
 * Returns Multiaddr as a human-readable string.
 * For post Node.js v10.0.0.
 * https://nodejs.org/api/deprecations.html#deprecations_dep0079_custom_inspection_function_on_objects_via_inspect
 *
 * @returns {string}
 * @example
 * console.log(Multiaddr('/ip4/127.0.0.1/tcp/4001'))
 * // '<Multiaddr 047f000001060fa1 - /ip4/127.0.0.1/tcp/4001>'
 */
Multiaddr.prototype[inspect] = function inspectCustom () {
  return '<Multiaddr ' +
    uint8ArrayToString(this.bytes, 'base16') + ' - ' +
    codec.bytesToString(this.bytes) + '>'
}

/**
 * Returns Multiaddr as a human-readable string.
 * Fallback for pre Node.js v10.0.0.
 * https://nodejs.org/api/deprecations.html#deprecations_dep0079_custom_inspection_function_on_objects_via_inspect
 *
 * @returns {string}
 * @example
 * Multiaddr('/ip4/127.0.0.1/tcp/4001').inspect()
 * // '<Multiaddr 047f000001060fa1 - /ip4/127.0.0.1/tcp/4001>'
 */
Multiaddr.prototype.inspect = function inspect () {
  return '<Multiaddr ' +
    uint8ArrayToString(this.bytes, 'base16') + ' - ' +
    codec.bytesToString(this.bytes) + '>'
}

/**
 * @typedef {object} protocol
 * @property {number} code
 * @property {number} size
 * @property {string} name
 * @property {boolean} [resolvable]
 * @property {boolean} [path]
 */

/**
 * Returns the protocols the Multiaddr is defined with, as an array of objects, in
 * left-to-right order. Each object contains the protocol code, protocol name,
 * and the size of its address space in bits.
 * [See list of protocols](https://github.com/multiformats/multiaddr/blob/master/protocols.csv)
 *
 * @returns {protocol[]} protocols - All the protocols the address is composed of
 * @example
 * Multiaddr('/ip4/127.0.0.1/tcp/4001').protos()
 * // [ { code: 4, size: 32, name: 'ip4' },
 * //   { code: 6, size: 16, name: 'tcp' } ]
 */
Multiaddr.prototype.protos = function protos () {
  return this.protoCodes().map(code => Object.assign({}, protocols(code)))
}

/**
 * Returns the codes of the protocols in left-to-right order.
 * [See list of protocols](https://github.com/multiformats/multiaddr/blob/master/protocols.csv)
 *
 * @returns {Array<number>} protocol codes
 * @example
 * Multiaddr('/ip4/127.0.0.1/tcp/4001').protoCodes()
 * // [ 4, 6 ]
 */
Multiaddr.prototype.protoCodes = function protoCodes () {
  const codes = []
  const buf = this.bytes
  let i = 0
  while (i < buf.length) {
    const code = varint.decode(buf, i)
    const n = varint.decode.bytes

    const p = protocols(code)
    const size = codec.sizeForAddr(p, buf.slice(i + n))

    i += (size + n)
    codes.push(code)
  }

  return codes
}

/**
 * Returns the names of the protocols in left-to-right order.
 * [See list of protocols](https://github.com/multiformats/multiaddr/blob/master/protocols.csv)
 *
 * @returns {Array.<string>} protocol names
 * @example
 * Multiaddr('/ip4/127.0.0.1/tcp/4001').protoNames()
 * // [ 'ip4', 'tcp' ]
 */
Multiaddr.prototype.protoNames = function protoNames () {
  return this.protos().map(proto => proto.name)
}

/**
 * Returns a tuple of parts
 *
 * @returns {[number, Uint8Array][]} tuples
 * @example
 * Multiaddr("/ip4/127.0.0.1/tcp/4001").tuples()
 * // [ [ 4, <Buffer 7f 00 00 01> ], [ 6, <Buffer 0f a1> ] ]
 */
Multiaddr.prototype.tuples = function tuples () {
  return codec.bytesToTuples(this.bytes)
}

/**
 * Returns a tuple of string/number parts
 * - tuples[][0] = code of protocol
 * - tuples[][1] = contents of address
 *
 * @returns {[number, string|number][]} tuples
 * @example
 * Multiaddr("/ip4/127.0.0.1/tcp/4001").stringTuples()
 * // [ [ 4, '127.0.0.1' ], [ 6, 4001 ] ]
 */
Multiaddr.prototype.stringTuples = function stringTuples () {
  const t = codec.bytesToTuples(this.bytes)
  return codec.tuplesToStringTuples(t)
}

/**
 * Encapsulates a Multiaddr in another Multiaddr
 *
 * @param {Multiaddr} addr - Multiaddr to add into this Multiaddr
 * @returns {Multiaddr}
 * @example
 * const mh1 = Multiaddr('/ip4/8.8.8.8/tcp/1080')
 * // <Multiaddr 0408080808060438 - /ip4/8.8.8.8/tcp/1080>
 *
 * const mh2 = Multiaddr('/ip4/127.0.0.1/tcp/4001')
 * // <Multiaddr 047f000001060fa1 - /ip4/127.0.0.1/tcp/4001>
 *
 * const mh3 = mh1.encapsulate(mh2)
 * // <Multiaddr 0408080808060438047f000001060fa1 - /ip4/8.8.8.8/tcp/1080/ip4/127.0.0.1/tcp/4001>
 *
 * mh3.toString()
 * // '/ip4/8.8.8.8/tcp/1080/ip4/127.0.0.1/tcp/4001'
 */
Multiaddr.prototype.encapsulate = function encapsulate (addr) {
  addr = Multiaddr(addr)
  return Multiaddr(this.toString() + addr.toString())
}

/**
 * Decapsulates a Multiaddr from another Multiaddr
 *
 * @param {Multiaddr} addr - Multiaddr to remove from this Multiaddr
 * @returns {Multiaddr}
 * @example
 * const mh1 = Multiaddr('/ip4/8.8.8.8/tcp/1080')
 * // <Multiaddr 0408080808060438 - /ip4/8.8.8.8/tcp/1080>
 *
 * const mh2 = Multiaddr('/ip4/127.0.0.1/tcp/4001')
 * // <Multiaddr 047f000001060fa1 - /ip4/127.0.0.1/tcp/4001>
 *
 * const mh3 = mh1.encapsulate(mh2)
 * // <Multiaddr 0408080808060438047f000001060fa1 - /ip4/8.8.8.8/tcp/1080/ip4/127.0.0.1/tcp/4001>
 *
 * mh3.decapsulate(mh2).toString()
 * // '/ip4/8.8.8.8/tcp/1080'
 */
Multiaddr.prototype.decapsulate = function decapsulate (addr) {
  addr = addr.toString()
  const s = this.toString()
  const i = s.lastIndexOf(addr)
  if (i < 0) {
    throw new Error('Address ' + this + ' does not contain subaddress: ' + addr)
  }
  return Multiaddr(s.slice(0, i))
}

/**
 * A more reliable version of `decapsulate` if you are targeting a
 * specific code, such as 421 (the `p2p` protocol code). The last index of the code
 * will be removed from the `Multiaddr`, and a new instance will be returned.
 * If the code is not present, the original `Multiaddr` is returned.
 *
 * @param {number} code - The code of the protocol to decapsulate from this Multiaddr
 * @returns {Multiaddr}
 * @example
 * const addr = Multiaddr('/ip4/0.0.0.0/tcp/8080/p2p/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSupNKC')
 * // <Multiaddr 0400... - /ip4/0.0.0.0/tcp/8080/p2p/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSupNKC>
 *
 * addr.decapsulateCode(421).toString()
 * // '/ip4/0.0.0.0/tcp/8080'
 *
 * Multiaddr('/ip4/127.0.0.1/tcp/8080').decapsulateCode(421).toString()
 * // '/ip4/127.0.0.1/tcp/8080'
 */
Multiaddr.prototype.decapsulateCode = function decapsulateCode (code) {
  const tuples = this.tuples()
  for (let i = tuples.length - 1; i >= 0; i--) {
    if (tuples[i][0] === code) {
      return Multiaddr(codec.tuplesToBytes(tuples.slice(0, i)))
    }
  }
  return this
}

/**
 * Extract the peerId if the multiaddr contains one
 *
 * @returns {string | null} peerId - The id of the peer or null if invalid or missing from the ma
 * @example
 * const mh1 = Multiaddr('/ip4/8.8.8.8/tcp/1080/ipfs/QmValidBase58string')
 * // <Multiaddr 0408080808060438 - /ip4/8.8.8.8/tcp/1080/ipfs/QmValidBase58string>
 *
 * // should return QmValidBase58string or null if the id is missing or invalid
 * const peerId = mh1.getPeerId()
 */
Multiaddr.prototype.getPeerId = function getPeerId () {
  let b58str = null
  try {
    const tuples = this.stringTuples().filter((tuple) => {
      if (tuple[0] === protocols.names.ipfs.code) {
        return true
      }
    })

    // Get the last id
    b58str = tuples.pop()[1]
    // Get multihash, unwrap from CID if needed
    b58str = uint8ArrayToString(new CID(b58str).multihash, 'base58btc')
  } catch (e) {
    b58str = null
  }

  return b58str
}

/**
 * Extract the path if the multiaddr contains one
 *
 * @returns {string | null} path - The path of the multiaddr, or null if no path protocol is present
 * @example
 * const mh1 = Multiaddr('/ip4/8.8.8.8/tcp/1080/unix/tmp/p2p.sock')
 * // <Multiaddr 0408080808060438 - /ip4/8.8.8.8/tcp/1080/unix/tmp/p2p.sock>
 *
 * // should return utf8 string or null if the id is missing or invalid
 * const path = mh1.getPath()
 */
Multiaddr.prototype.getPath = function getPath () {
  let path = null
  try {
    path = this.stringTuples().filter((tuple) => {
      const proto = protocols(tuple[0])
      if (proto.path) {
        return true
      }
    })[0][1]
  } catch (e) {
    path = null
  }

  return path
}

/**
 * Checks if two Multiaddrs are the same
 *
 * @param {Multiaddr} addr
 * @returns {Bool}
 * @example
 * const mh1 = Multiaddr('/ip4/8.8.8.8/tcp/1080')
 * // <Multiaddr 0408080808060438 - /ip4/8.8.8.8/tcp/1080>
 *
 * const mh2 = Multiaddr('/ip4/127.0.0.1/tcp/4001')
 * // <Multiaddr 047f000001060fa1 - /ip4/127.0.0.1/tcp/4001>
 *
 * mh1.equals(mh1)
 * // true
 *
 * mh1.equals(mh2)
 * // false
 */
Multiaddr.prototype.equals = function equals (addr) {
  return uint8ArrayEquals(this.bytes, addr.bytes)
}

/**
 * Resolve multiaddr if containing resolvable hostname.
 *
 * @returns {Promise<Array<Multiaddr>>}
 * @example
 * Multiaddr.resolvers.set('dnsaddr', resolverFunction)
 * const mh1 = Multiaddr('/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb')
 * const resolvedMultiaddrs = await mh1.resolve()
 * // [
 * //   <Multiaddr 04934b5353060fa1a503221220c10f9319dac35c270a6b74cd644cb3acfc1f6efc8c821f8eb282599fd1814f64 - /ip4/147.75.83.83/tcp/4001/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb>,
 * //   <Multiaddr 04934b53530601bbde03a503221220c10f9319dac35c270a6b74cd644cb3acfc1f6efc8c821f8eb282599fd1814f64 - /ip4/147.75.83.83/tcp/443/wss/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb>,
 * //   <Multiaddr 04934b535391020fa1cc03a503221220c10f9319dac35c270a6b74cd644cb3acfc1f6efc8c821f8eb282599fd1814f64 - /ip4/147.75.83.83/udp/4001/quic/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb>
 * // ]
 */
Multiaddr.prototype.resolve = async function resolve () {
  const resolvableProto = this.protos().find((p) => p.resolvable)

  // Multiaddr is not resolvable?
  if (!resolvableProto) {
    return [this]
  }

  const resolver = resolvers.get(resolvableProto.name)
  if (!resolver) {
    throw errCode(new Error(`no available resolver for ${resolvableProto.name}`), 'ERR_NO_AVAILABLE_RESOLVER')
  }

  const addresses = await resolver(this)
  return addresses.map(a => Multiaddr(a))
}

/**
 * Gets a Multiaddrs node-friendly address object. Note that protocol information
 * is left out: in Node (and most network systems) the protocol is unknowable
 * given only the address.
 *
 * Has to be a ThinWaist Address, otherwise throws error
 *
 * @returns {{family: string, address: string, port: number}}
 * @throws {Error} Throws error if Multiaddr is not a Thin Waist address
 * @example
 * Multiaddr('/ip4/127.0.0.1/tcp/4001').nodeAddress()
 * // {family: 'IPv4', address: '127.0.0.1', port: '4001'}
 */
Multiaddr.prototype.nodeAddress = function nodeAddress () {
  const codes = this.protoCodes()
  const names = this.protoNames()
  const parts = this.toString().split('/').slice(1)

  if (parts.length < 4) {
    throw new Error('multiaddr must have a valid format: "/{ip4, ip6, dns4, dns6}/{address}/{tcp, udp}/{port}".')
  } else if (codes[0] !== 4 && codes[0] !== 41 && codes[0] !== 54 && codes[0] !== 55) {
    throw new Error(`no protocol with name: "'${names[0]}'". Must have a valid family name: "{ip4, ip6, dns4, dns6}".`)
  } else if (parts[2] !== 'tcp' && parts[2] !== 'udp') {
    throw new Error(`no protocol with name: "'${names[1]}'". Must have a valid transport protocol: "{tcp, udp}".`)
  }

  return {
    family: (codes[0] === 41 || codes[0] === 55) ? 6 : 4,
    address: parts[1], // ip addr
    port: parseInt(parts[3]) // tcp or udp port
  }
}

/**
 * Creates a Multiaddr from a node-friendly address object
 *
 * @param {{family: string, address: string, port: number}} addr
 * @param {string} transport
 * @returns {Multiaddr} multiaddr
 * @throws {Error} Throws error if addr is not truthy
 * @throws {Error} Throws error if transport is not truthy
 * @example
 * Multiaddr.fromNodeAddress({address: '127.0.0.1', port: '4001'}, 'tcp')
 * // <Multiaddr 047f000001060fa1 - /ip4/127.0.0.1/tcp/4001>
 */
Multiaddr.fromNodeAddress = function fromNodeAddress (addr, transport) {
  if (!addr) throw new Error('requires node address object')
  if (!transport) throw new Error('requires transport protocol')
  let ip
  switch (addr.family) {
    case 'IPv4':
      ip = 'ip4'
      break
    case 'IPv6':
      ip = 'ip6'
      break
    default:
      throw Error(`Invalid addr family. Got '${addr.family}' instead of 'IPv4' or 'IPv6'`)
  }
  return Multiaddr('/' + [ip, addr.address, transport, addr.port].join('/'))
}

// TODO find a better example, not sure about it's good enough
/**
 * Returns if a Multiaddr is a Thin Waist address or not.
 *
 * Thin Waist is if a Multiaddr adheres to the standard combination of:
 *
 * `{IPv4, IPv6}/{TCP, UDP}`
 *
 * @param {Multiaddr} [addr] - Defaults to using `this` instance
 * @returns {boolean} isThinWaistAddress
 * @example
 * const mh1 = Multiaddr('/ip4/127.0.0.1/tcp/4001')
 * // <Multiaddr 047f000001060fa1 - /ip4/127.0.0.1/tcp/4001>
 * const mh2 = Multiaddr('/ip4/192.168.2.1/tcp/5001')
 * // <Multiaddr 04c0a80201061389 - /ip4/192.168.2.1/tcp/5001>
 * const mh3 = mh1.encapsulate(mh2)
 * // <Multiaddr 047f000001060fa104c0a80201061389 - /ip4/127.0.0.1/tcp/4001/ip4/192.168.2.1/tcp/5001>
 * mh1.isThinWaistAddress()
 * // true
 * mh2.isThinWaistAddress()
 * // true
 * mh3.isThinWaistAddress()
 * // false
 */
Multiaddr.prototype.isThinWaistAddress = function isThinWaistAddress (addr) {
  const protos = (addr || this).protos()

  if (protos.length !== 2) {
    return false
  }

  if (protos[0].code !== 4 && protos[0].code !== 41) {
    return false
  }
  if (protos[1].code !== 6 && protos[1].code !== 273) {
    return false
  }
  return true
}

/**
 * Object containing table, names and codes of all supported protocols.
 * To get the protocol values from a Multiaddr, you can use
 * [`.protos()`](#multiaddrprotos),
 * [`.protoCodes()`](#multiaddrprotocodes) or
 * [`.protoNames()`](#multiaddrprotonames)
 *
 * @instance
 * @returns {{table: Array, names: Object, codes: Object}}
 *
 */
Multiaddr.protocols = protocols

/**
 * Returns if something is a Multiaddr that is a name
 *
 * @param {Multiaddr} addr
 * @returns {Bool} isName
 */
Multiaddr.isName = function isName (addr) {
  if (!Multiaddr.isMultiaddr(addr)) {
    return false
  }

  // if a part of the multiaddr is resolvable, then return true
  return addr.protos().some((proto) => proto.resolvable)
}

/**
 * Returns an array of multiaddrs, by resolving the multiaddr that is a name
 *
 * @async
 * @param {Multiaddr} addr
 * @returns {Multiaddr[]}
 */
Multiaddr.resolve = function resolve (addr) {
  if (!Multiaddr.isMultiaddr(addr) || !Multiaddr.isName(addr)) {
    return Promise.reject(Error('not a valid name'))
  }

  /*
   * Needs more consideration from spec design:
   *   - what to return
   *   - how to achieve it in the browser?
   */
  return Promise.reject(new Error('not implemented yet'))
}

Multiaddr.resolvers = resolvers
exports = module.exports = Multiaddr
