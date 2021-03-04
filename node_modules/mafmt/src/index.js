'use strict'

const multiaddr = require('multiaddr')

/*
 * Valid combinations
 */
const DNS4 = base('dns4')
const DNS6 = base('dns6')
const DNSADDR = base('dnsaddr')
const DNS = or(
  base('dns'),
  DNSADDR,
  DNS4,
  DNS6
)

const IP = or(base('ip4'), base('ip6'))
const TCP = or(
  and(IP, base('tcp')),
  and(DNS, base('tcp'))
)
const UDP = and(IP, base('udp'))
const UTP = and(UDP, base('utp'))

const QUIC = and(UDP, base('quic'))

const WebSockets = or(
  and(TCP, base('ws')),
  and(DNS, base('ws'))
)

const WebSocketsSecure = or(
  and(TCP, base('wss')),
  and(DNS, base('wss'))
)

const HTTP = or(
  and(TCP, base('http')),
  and(IP, base('http')),
  and(DNS, base('http'))
)

const HTTPS = or(
  and(TCP, base('https')),
  and(IP, base('https')),
  and(DNS, base('https'))
)

const WebRTCStar = or(
  and(WebSockets, base('p2p-webrtc-star'), base('p2p')),
  and(WebSocketsSecure, base('p2p-webrtc-star'), base('p2p')),
  and(WebSockets, base('p2p-webrtc-star')),
  and(WebSocketsSecure, base('p2p-webrtc-star'))
)

const WebSocketStar = or(
  and(WebSockets, base('p2p-websocket-star'), base('p2p')),
  and(WebSocketsSecure, base('p2p-websocket-star'), base('p2p')),
  and(WebSockets, base('p2p-websocket-star')),
  and(WebSocketsSecure, base('p2p-websocket-star'))
)

const WebRTCDirect = or(
  and(HTTP, base('p2p-webrtc-direct'), base('p2p')),
  and(HTTPS, base('p2p-webrtc-direct'), base('p2p')),
  and(HTTP, base('p2p-webrtc-direct')),
  and(HTTPS, base('p2p-webrtc-direct'))
)

const Reliable = or(
  WebSockets,
  WebSocketsSecure,
  HTTP,
  HTTPS,
  WebRTCStar,
  WebRTCDirect,
  TCP,
  UTP,
  QUIC,
  DNS
)

// Unlike ws-star, stardust can run over any transport thus removing the requirement for websockets (but don't even think about running a stardust server over webrtc-star ;) )
const Stardust = or(
  and(Reliable, base('p2p-stardust'), base('p2p')),
  and(Reliable, base('p2p-stardust'))
)

const _P2P = or(
  and(Reliable, base('p2p')),
  WebRTCStar,
  WebRTCDirect,
  base('p2p')
)

const _Circuit = or(
  and(_P2P, base('p2p-circuit'), _P2P),
  and(_P2P, base('p2p-circuit')),
  and(base('p2p-circuit'), _P2P),
  and(Reliable, base('p2p-circuit')),
  and(base('p2p-circuit'), Reliable),
  base('p2p-circuit')
)

const CircuitRecursive = () => or(
  and(_Circuit, CircuitRecursive),
  _Circuit
)

const Circuit = CircuitRecursive()

const P2P = or(
  and(Circuit, _P2P, Circuit),
  and(_P2P, Circuit),
  and(Circuit, _P2P),
  Circuit,
  _P2P
)

exports.DNS = DNS
exports.DNS4 = DNS4
exports.DNS6 = DNS6
exports.DNSADDR = DNSADDR
exports.IP = IP
exports.TCP = TCP
exports.UDP = UDP
exports.QUIC = QUIC
exports.UTP = UTP
exports.HTTP = HTTP
exports.HTTPS = HTTPS
exports.WebSockets = WebSockets
exports.WebSocketsSecure = WebSocketsSecure
exports.WebSocketStar = WebSocketStar
exports.WebRTCStar = WebRTCStar
exports.WebRTCDirect = WebRTCDirect
exports.Reliable = Reliable
exports.Stardust = Stardust
exports.Circuit = Circuit
exports.P2P = P2P
exports.IPFS = P2P

/*
 * Validation funcs
 */

function makeMatchesFunction (partialMatch) {
  return function matches (a) {
    if (!multiaddr.isMultiaddr(a)) {
      try {
        a = multiaddr(a)
      } catch (err) { // catch error
        return false // also if it's invalid it's propably not matching as well so return false
      }
    }
    const out = partialMatch(a.protoNames())
    if (out === null) {
      return false
    }
    return out.length === 0
  }
}

function and () {
  const args = Array.from(arguments)
  function partialMatch (a) {
    if (a.length < args.length) {
      return null
    }
    args.some((arg) => {
      a = typeof arg === 'function'
        ? arg().partialMatch(a)
        : arg.partialMatch(a)

      if (a === null) {
        return true
      }
    })

    return a
  }

  return {
    toString: function () { return '{ ' + args.join(' ') + ' }' },
    input: args,
    matches: makeMatchesFunction(partialMatch),
    partialMatch: partialMatch
  }
}

function or () {
  const args = Array.from(arguments)

  function partialMatch (a) {
    let out = null
    args.some((arg) => {
      const res = typeof arg === 'function'
        ? arg().partialMatch(a)
        : arg.partialMatch(a)
      if (res) {
        out = res
        return true
      }
    })

    return out
  }

  const result = {
    toString: function () { return '{ ' + args.join(' ') + ' }' },
    input: args,
    matches: makeMatchesFunction(partialMatch),
    partialMatch: partialMatch
  }

  return result
}

function base (n) {
  const name = n

  function matches (a) {
    if (typeof a === 'string') {
      try {
        a = multiaddr(a)
      } catch (err) { // catch error
        return false // also if it's invalid it's propably not matching as well so return false
      }
    }

    const pnames = a.protoNames()
    if (pnames.length === 1 && pnames[0] === name) {
      return true
    }
    return false
  }

  function partialMatch (protos) {
    if (protos.length === 0) {
      return null
    }

    if (protos[0] === name) {
      return protos.slice(1)
    }
    return null
  }

  return {
    toString: function () { return name },
    matches: matches,
    partialMatch: partialMatch
  }
}
