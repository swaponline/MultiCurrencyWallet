'use strict'

const encoder = require('./encoder')

function boolEncodingLength () {
  return 1
}

function boolEncode (value, buffer, dataView, offset) {
  buffer[offset] = value ? 1 : 0
  boolEncode.bytes = 1
}

function boolDecode (buffer, dataView, offset) {
  const bool = buffer[offset] > 0
  boolDecode.bytes = 1

  return bool
}

module.exports = encoder(0, boolEncode, boolDecode, boolEncodingLength)
