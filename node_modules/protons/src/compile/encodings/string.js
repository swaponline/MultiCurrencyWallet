'use strict'

const varint = require('varint')
const uint8ArrayFromString = require('uint8arrays/from-string')
const uint8ArrayToString = require('uint8arrays/to-string')
const encoder = require('./encoder')

function stringEncodingLength (val) {
  const len = uint8ArrayFromString(val).byteLength
  return varint.encodingLength(len) + len
}

function stringEncode (val, buffer, dataView, offset) {
  const oldOffset = offset
  const len = uint8ArrayFromString(val).byteLength

  varint.encode(len, buffer, offset, 'utf-8')
  offset += varint.encode.bytes

  const arr = uint8ArrayFromString(val)
  buffer.set(arr, offset)
  offset += arr.length

  stringEncode.bytes = offset - oldOffset
}

function stringDecode (buffer, dataView, offset) {
  const oldOffset = offset

  const len = varint.decode(buffer, offset)
  offset += varint.decode.bytes

  const val = uint8ArrayToString(buffer.subarray(offset, offset + len))
  offset += len

  stringDecode.bytes = offset - oldOffset

  return val
}

module.exports = encoder(2, stringEncode, stringDecode, stringEncodingLength)
