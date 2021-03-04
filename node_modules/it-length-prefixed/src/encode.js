'use strict'

const { Buffer } = require('buffer')
const BufferList = require('bl/BufferList')
const varintEncode = require('./varint-encode')

const MIN_POOL_SIZE = 8 // Varint.encode(Number.MAX_SAFE_INTEGER).length
const DEFAULT_POOL_SIZE = 10 * 1024

function encode (options) {
  options = options || {}

  const poolSize = Math.max(options.poolSize || DEFAULT_POOL_SIZE, options.minPoolSize || MIN_POOL_SIZE)
  const encodeLength = options.lengthEncoder || varintEncode

  return source => (async function * () {
    let pool = Buffer.alloc(poolSize)
    let poolOffset = 0

    for await (const chunk of source) {
      encodeLength(chunk.length, pool, poolOffset)
      const encodedLength = pool.slice(poolOffset, poolOffset + encodeLength.bytes)
      poolOffset += encodeLength.bytes

      if (pool.length - poolOffset < MIN_POOL_SIZE) {
        pool = Buffer.alloc(poolSize)
        poolOffset = 0
      }

      yield new BufferList().append(encodedLength).append(chunk)
      // yield Buffer.concat([encodedLength, chunk])
    }
  })()
}

encode.single = (chunk, options) => {
  options = options || {}
  const encodeLength = options.lengthEncoder || varintEncode
  return new BufferList([encodeLength(chunk.length), chunk])
}

module.exports = encode
module.exports.MIN_POOL_SIZE = MIN_POOL_SIZE
module.exports.DEFAULT_POOL_SIZE = DEFAULT_POOL_SIZE
