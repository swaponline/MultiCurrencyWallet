'use strict'

const Varint = require('varint')
const { Buffer } = require('buffer')

// Encode the passed length `value` to the `target` buffer at the given `offset`
const varintEncode = (value, target, offset) => {
  const ret = Varint.encode(value, target, offset)
  varintEncode.bytes = Varint.encode.bytes
  // If no target, create Buffer from returned array
  return target || Buffer.from(ret)
}

module.exports = varintEncode
