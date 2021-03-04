'use strict'

const varint = require('varint')
const encoder = require('./encoder')

function int64Encode (val, buffer, dataView, offset) {
  if (val < 0) {
    const last = offset + 9
    varint.encode(val * -1, buffer, offset)

    offset += varint.encode.bytes - 1
    buffer[offset] = buffer[offset] | 0x80

    while (offset < last - 1) {
      offset++
      buffer[offset] = 0xff
    }
    buffer[last] = 0x01

    int64Encode.bytes = 10
  } else {
    varint.encode(val, buffer, offset)
    int64Encode.bytes = varint.encode.bytes
  }
}

function int64Decode (buffer, dataView, offset) {
  let val = varint.decode(buffer, offset)

  if (val >= Math.pow(2, 63)) {
    let limit = 9
    while (buffer[offset + limit - 1] === 0xff) limit--
    limit = limit || 9
    const subset = buffer.subarray(offset, offset + limit)
    subset[limit - 1] = subset[limit - 1] & 0x7f
    val = -1 * varint.decode(subset, 0)
    int64Decode.bytes = 10
  } else {
    int64Decode.bytes = varint.decode.bytes
  }

  return val
}

function int64EncodingLength (val) {
  return val < 0 ? 10 : varint.encodingLength(val)
}

module.exports = encoder(0, int64Encode, int64Decode, int64EncodingLength)
