'use strict'

const encoder = require('./encoder')

function sfixed32EncodingLength (val) {
  return 4
}

function sfixed32Encode (val, buffer, dataView, offset) {
  dataView.setInt32(offset, val, true)
  sfixed32Encode.bytes = 4
}

function sfixed32Decode (buffer, dataView, offset) {
  const val = dataView.getInt32(offset, true)
  sfixed32Decode.bytes = 4

  return val
}

module.exports = encoder(5, sfixed32Encode, sfixed32Decode, sfixed32EncodingLength)
