'use strict'

const encoder = require('./encoder')

function floatEncodingLength () {
  return 4
}

function floatEncode (val, buffer, dataView, offset) {
  dataView.setFloat32(offset, val, true)
  floatEncode.bytes = 4
}

function floatDecode (buffer, dataView, offset) {
  const val = dataView.getFloat32(offset, true)
  floatDecode.bytes = 4

  return val
}

module.exports = encoder(5, floatEncode, floatDecode, floatEncodingLength)
