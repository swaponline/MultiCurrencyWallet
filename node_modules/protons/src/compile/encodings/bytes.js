'use strict'

const varint = require('varint')
const encoder = require('./encoder')

function bytesBufferLength (val) {
  return val.byteLength
}

function bytesEncodingLength (val) {
  const len = bytesBufferLength(val)
  return varint.encodingLength(len) + len
}

function bytesEncode (val, buffer, dataView, offset) {
  const oldOffset = offset
  const len = bytesBufferLength(val)

  varint.encode(len, buffer, offset)
  offset += varint.encode.bytes

  buffer.set(val, offset)
  offset += len

  bytesEncode.bytes = offset - oldOffset
}

function bytesDecode (buffer, dataView, offset) {
  const oldOffset = offset

  const len = varint.decode(buffer, offset)
  offset += varint.decode.bytes

  const val = buffer.slice(offset, offset + len)
  offset += val.length

  bytesDecode.bytes = offset - oldOffset

  return val
}

module.exports = encoder(2, bytesEncode, bytesDecode, bytesEncodingLength)
