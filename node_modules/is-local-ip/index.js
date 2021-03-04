'use strict'

module.exports = isLocalIp

// Matches all local ip ranges.
var RANGES = [
  // 10.0.0.0 - 10.255.255.255
  /^(::f{4}:)?10\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
  // 127.0.0.0 - 127.255.255.255
  /^(::f{4}:)?127\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
  // 169.254.1.0 - 169.254.254.255
  /^(::f{4}:)?169\.254\.([1-9]|1?\d\d|2[0-4]\d|25[0-4])\.\d{1,3}/,
  // 172.16.0.0 - 172.31.255.255
  /^(::f{4}:)?(172\.1[6-9]|172\.2\d|172\.3[0-1])\.\d{1,3}\.\d{1,3}/,
  // 192.168.0.0 - 192.168.255.255
  /^(::f{4}:)?192\.168\.\d{1,3}\.\d{1,3}/,
  // fc00::/7
  /^f[c-d][0-9a-f]{2}(::1$|:[0-9a-f]{1,4}){1,7}/,
  // fe80::/10
  /^fe[89ab][0-9a-f](::1$|:[0-9a-f]{1,4}){1,7}/
]

/**
 * Tests that an ip address is one that is reserved for local area, or internal networks.
 */
function isLocalIp (address) {
  return (
    address === '::' ||
    address === '::1' ||
    RANGES.some(function (it) { return it.test(address) })
  )
}
