'use strict'

const { Buffer } = require('buffer')

const int32BEEncode = (value, target, offset) => {
  target = target || Buffer.allocUnsafe(4)
  target.writeInt32BE(value, offset)
  return target
}

int32BEEncode.bytes = 4 // Always because fixed length

module.exports = int32BEEncode
