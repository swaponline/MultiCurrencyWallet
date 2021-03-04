'use strict'

const { Buffer } = require('buffer')
const Varint = require('varint')

const toBufferProxy = bl => new Proxy({}, {
  get: (_, prop) => prop[0] === 'l' ? bl[prop] : bl.get(parseInt(prop))
})

const varintDecode = data => {
  const len = Varint.decode(Buffer.isBuffer(data) ? data : toBufferProxy(data))
  varintDecode.bytes = Varint.decode.bytes
  return len
}

module.exports = varintDecode
