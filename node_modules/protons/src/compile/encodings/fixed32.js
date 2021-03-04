'use strict'

const encoder = require('./encoder')

function fixed32EncodingLength (val) {
  return 4
}

function fixed32Encode (val, buffer, dataView, offset) {
  dataView.setUint32(offset, val, true)
  fixed32Encode.bytes = 4
}

function fixed32Decode (buffer, dataView, offset) {
  const val = dataView.getUint32(offset, true)
  fixed32Decode.bytes = 4

  return val
}

module.exports = encoder(5, fixed32Encode, fixed32Decode, fixed32EncodingLength)
