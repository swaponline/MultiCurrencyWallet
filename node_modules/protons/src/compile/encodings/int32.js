'use strict'

const varint = require('varint')
const encoder = require('./encoder')

function in32Encode (val, buffer, dataView, offset) {
  varint.encode(val < 0 ? val + 4294967296 : val, buffer, offset)
  in32Encode.bytes = varint.encode.bytes
}

function int32Decode (buffer, dataView, offset) {
  const val = varint.decode(buffer, offset)
  int32Decode.bytes = varint.decode.bytes

  return val > 2147483647 ? val - 4294967296 : val
}

function int32EncodingLength (val) {
  return varint.encodingLength(val < 0 ? val + 4294967296 : val)
}

module.exports = encoder(0, in32Encode, int32Decode, int32EncodingLength)
