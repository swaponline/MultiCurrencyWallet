'use strict'

/**
 * Check if a given ip address is a loopback address
 *
 * @param {string} ip - ip address to check
 * @returns {boolean}
 */
function isLoopbackAddr (ip) {
  return /^127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(ip) ||
    /^::1$/.test(ip)
}

module.exports = isLoopbackAddr
