'use strict'

const svarint = require('signed-varint')
const encoder = require('./encoder')

function svarintEncode (val, buffer, dataView, offset) {
  svarint.encode(val, buffer, offset)

  svarintEncode.bytes = svarint.encode.bytes
}

function svarintDecode (buffer, dataView, offset) {
  const val = svarint.decode(buffer, offset)
  svarintDecode.bytes = svarint.decode.bytes

  return val
}

module.exports = encoder(0, svarintEncode, svarintDecode, svarint.encodingLength)
