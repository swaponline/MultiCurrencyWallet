'use strict'

const log = require('debug')('mss:handle')
const BufferList = require('bl/BufferList')
const multistream = require('./multistream')
const handshake = require('it-handshake')
const { PROTOCOL_ID } = require('./constants')

module.exports = async (stream, protocols) => {
  protocols = Array.isArray(protocols) ? protocols : [protocols]
  const { writer, reader, rest, stream: shakeStream } = handshake(stream)

  while (true) {
    const protocol = (await multistream.read(reader)).toString()
    log('read "%s"', protocol)

    if (protocol === PROTOCOL_ID) {
      log('respond with "%s" for "%s"', PROTOCOL_ID, protocol)
      multistream.write(writer, PROTOCOL_ID)
      continue
    }

    if (protocols.includes(protocol)) {
      multistream.write(writer, protocol)
      log('respond with "%s" for "%s"', protocol, protocol)
      rest()
      return { stream: shakeStream, protocol }
    }

    if (protocol === 'ls') {
      // <varint-msg-len><varint-proto-name-len><proto-name>\n<varint-proto-name-len><proto-name>\n\n
      multistream.write(writer, new BufferList(
        protocols.map(p => multistream.encode(p))
      ))
      log('respond with "%s" for %s', protocols, protocol)
      continue
    }

    multistream.write(writer, 'na')
    log('respond with "na" for "%s"', protocol)
  }
}
