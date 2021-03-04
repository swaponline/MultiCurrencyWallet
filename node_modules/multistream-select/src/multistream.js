'use strict'

const BufferList = require('bl/BufferList')
const lp = require('it-length-prefixed')
const pipe = require('it-pipe')
const errCode = require('err-code')
const uint8ArrayFromString = require('uint8arrays/from-string')

const NewLine = uint8ArrayFromString('\n')

async function oneChunk (source) {
  for await (const chunk of source) return chunk // We only need one!
}

exports.encode = buffer => lp.encode.single(new BufferList([buffer, NewLine]))

// `write` encodes and writes a single buffer
exports.write = (writer, buffer) => writer.push(exports.encode(buffer))

// `writeAll` behaves like `write`, except it encodes an array of items as a single write
exports.writeAll = (writer, buffers) => {
  writer.push(buffers.reduce((bl, buffer) => bl.append(exports.encode(buffer)), new BufferList()))
}

exports.read = async reader => {
  let byteLength = 1 // Read single byte chunks until the length is known
  const varByteSource = { // No return impl - we want the reader to remain readable
    [Symbol.asyncIterator] () { return this },
    next: () => reader.next(byteLength)
  }

  // Once the length has been parsed, read chunk for that length
  const onLength = l => { byteLength = l }
  const buf = await pipe(varByteSource, lp.decode({ onLength }), oneChunk)

  if (buf.get(buf.length - 1) !== NewLine[0]) {
    throw errCode(new Error('missing newline'), 'ERR_INVALID_MULTISTREAM_SELECT_MESSAGE')
  }

  return buf.shallowSlice(0, -1) // Remove newline
}
