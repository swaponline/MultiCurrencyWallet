'use strict'

const encoder = require('./encoder')

function fixed64EncodingLength () {
  return 8
}

function fixed64Encode (val, buffer, dataView, offset) {
  for (const byte of val) {
    buffer[offset] = byte
    offset++
  }

  fixed64Encode.bytes = 8
}

function fixed64Decode (buffer, dataView, offset) {
  const val = buffer.slice(offset, offset + 8)
  fixed64Decode.bytes = 8

  return val
}

module.exports = encoder(1, fixed64Encode, fixed64Decode, fixed64EncodingLength)
