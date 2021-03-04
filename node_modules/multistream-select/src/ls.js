'use strict'

const Reader = require('it-reader')
const log = require('debug')('it-multistream-select:ls')
const multistream = require('./multistream')
const handshake = require('it-handshake')
const lp = require('it-length-prefixed')
const pipe = require('it-pipe')

module.exports = async stream => {
  const { reader, writer, rest, stream: shakeStream } = handshake(stream)

  log('write "ls"')
  multistream.write(writer, 'ls')
  rest()

  // Next message from remote will be (e.g. for 2 protocols):
  // <varint-msg-len><varint-proto-name-len><proto-name>\n<varint-proto-name-len><proto-name>\n
  const res = await multistream.read(reader)

  // After reading response we have:
  // <varint-proto-name-len><proto-name>\n<varint-proto-name-len><proto-name>\n
  const protocolsReader = Reader([res])
  const protocols = []

  // Decode each of the protocols from the reader
  await pipe(
    protocolsReader,
    lp.decode(),
    async source => {
      for await (const protocol of source) {
        // Remove the newline
        protocols.push(protocol.shallowSlice(0, -1).toString())
      }
    }
  )

  return { stream: shakeStream, protocols }
}
