'use strict'

const encoder = require('./encoder')

function doubleEncodingLength () {
  return 8
}

function doubleEncode (val, buffer, dataView, offset) {
  dataView.setFloat64(offset, val, true)
  doubleEncode.bytes = 8
}

function doubleDecode (buffer, dataView, offset) {
  const val = dataView.getFloat64(offset, true)
  doubleDecode.bytes = 8

  return val
}

module.exports = encoder(1, doubleEncode, doubleDecode, doubleEncodingLength)
