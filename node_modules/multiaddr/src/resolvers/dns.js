'use strict'

let dns

try {
  dns = require('dns').promises
  if (!dns) {
    throw new Error('no dns available')
  }
} catch (err) {
  dns = require('dns-over-http-resolver')
}

module.exports = dns
