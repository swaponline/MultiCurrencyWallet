'use strict'

const { Buffer } = require('buffer')
const BufferList = require('bl/BufferList')
const varintDecode = require('./varint-decode')

// Maximum length of the length section of the message
const MAX_LENGTH_LENGTH = 8 // Varint.encode(Number.MAX_SAFE_INTEGER).length
// Maximum length of the data section of the message
const MAX_DATA_LENGTH = 1024 * 1024 * 4

const Empty = Buffer.alloc(0)
const ReadModes = { LENGTH: 'readLength', DATA: 'readData' }

const ReadHandlers = {
  [ReadModes.LENGTH]: (chunk, buffer, state, options) => {
    // console.log(ReadModes.LENGTH, chunk.length)
    buffer = buffer.append(chunk)

    let dataLength
    try {
      dataLength = options.lengthDecoder(buffer)
    } catch (err) {
      if (buffer.length > options.maxLengthLength) {
        throw Object.assign(err, { message: 'message length too long', code: 'ERR_MSG_LENGTH_TOO_LONG' })
      }
      if (err instanceof RangeError) {
        return { mode: ReadModes.LENGTH, buffer }
      }
      throw err
    }

    if (dataLength > options.maxDataLength) {
      throw Object.assign(new Error('message data too long'), { code: 'ERR_MSG_DATA_TOO_LONG' })
    }

    chunk = buffer.shallowSlice(options.lengthDecoder.bytes)
    buffer = new BufferList()

    if (options.onLength) options.onLength(dataLength)

    if (dataLength <= 0) {
      if (options.onData) options.onData(Empty)
      return { mode: ReadModes.LENGTH, chunk, buffer, data: Empty }
    }

    return { mode: ReadModes.DATA, chunk, buffer, state: { dataLength } }
  },

  [ReadModes.DATA]: (chunk, buffer, state, options) => {
    // console.log(ReadModes.DATA, chunk.length)
    buffer = buffer.append(chunk)

    if (buffer.length < state.dataLength) {
      return { mode: ReadModes.DATA, buffer, state }
    }

    const { dataLength } = state
    const data = buffer.shallowSlice(0, dataLength)

    chunk = buffer.length > dataLength ? buffer.shallowSlice(dataLength) : null
    buffer = new BufferList()

    if (options.onData) options.onData(data)
    return { mode: ReadModes.LENGTH, chunk, buffer, data }
  }
}

function decode (options) {
  options = options || {}
  options.lengthDecoder = options.lengthDecoder || varintDecode
  options.maxLengthLength = options.maxLengthLength || MAX_LENGTH_LENGTH
  options.maxDataLength = options.maxDataLength || MAX_DATA_LENGTH

  return source => (async function * () {
    let buffer = new BufferList()
    let mode = ReadModes.LENGTH // current parsing mode
    let state // accumulated state for the current mode

    for await (let chunk of source) {
      // Each chunk may contain multiple messages - keep calling handler for the
      // current parsing mode until all handlers have consumed the chunk.
      while (chunk) {
        const result = ReadHandlers[mode](chunk, buffer, state, options)
        ;({ mode, chunk, buffer, state } = result)
        if (result.data) yield result.data
      }
    }

    if (buffer.length) {
      throw Object.assign(new Error('unexpected end of input'), { code: 'ERR_UNEXPECTED_EOF' })
    }
  })()
}

decode.fromReader = (reader, options) => {
  options = options || {}

  let byteLength = 1 // Read single byte chunks until the length is known
  const varByteSource = {
    [Symbol.asyncIterator] () { return this },
    next: async () => {
      try {
        return await reader.next(byteLength)
      } catch (err) {
        if (err.code === 'ERR_UNDER_READ') {
          return { done: true, value: null }
        }
        throw err
      } finally {
        // Reset the byteLength so we continue to check for varints
        byteLength = 1
      }
    }
  }

  // Once the length has been parsed, read chunk for that length
  options.onLength = l => { byteLength = l }
  return decode(options)(varByteSource)
}

module.exports = decode
module.exports.MAX_LENGTH_LENGTH = MAX_LENGTH_LENGTH
module.exports.MAX_DATA_LENGTH = MAX_DATA_LENGTH
