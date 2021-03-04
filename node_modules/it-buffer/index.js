'use strict'

const { Buffer } = require('buffer')
const BufferList = require('bl/BufferList')

module.exports = async function * (source) {
  for await (const b of source) {
    if (Buffer.isBuffer(b)) {
      yield b
    } else if (BufferList.isBufferList(b)) {
      yield b.slice()
    } else {
      yield Buffer.from(b)
    }
  }
}

module.exports.toBuffer = module.exports

module.exports.toList = async function * (source) {
  for await (const b of source) {
    if (Buffer.isBuffer(b)) {
      yield new BufferList().append(b)
    } else if (BufferList.isBufferList(b)) {
      yield b
    } else {
      yield new BufferList().append(Buffer.from(b))
    }
  }
}
