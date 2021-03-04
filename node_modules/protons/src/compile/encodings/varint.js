'use strict'

const varint = require('varint')
const encoder = require('./encoder')

function varintEncode (val, buffer, dataView, offset) {
  varint.encode(val, buffer, offset)

  varintEncode.bytes = varint.encode.bytes
}

function varintDecode (buffer, dataView, offset) {
  const val = varint.decode(buffer, offset)
  varintDecode.bytes = varint.decode.bytes

  return val
}

module.exports = encoder(0, varintEncode, varintDecode, varint.encodingLength)
