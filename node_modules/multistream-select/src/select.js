'use strict'

const log = require('debug')('mss:select')
const errCode = require('err-code')
const multistream = require('./multistream')
const handshake = require('it-handshake')

module.exports = async (stream, protocols, protocolId) => {
  protocols = Array.isArray(protocols) ? [...protocols] : [protocols]
  const { reader, writer, rest, stream: shakeStream } = handshake(stream)

  const protocol = protocols.shift()
  if (protocolId) {
    log('select: write ["%s", "%s"]', protocolId, protocol)
    multistream.writeAll(writer, [protocolId, protocol])
  } else {
    log('select: write "%s"', protocol)
    multistream.write(writer, protocol)
  }

  let response = (await multistream.read(reader)).toString()
  log('select: read "%s"', response)

  // Read the protocol response if we got the protocolId in return
  if (response === protocolId) {
    response = (await multistream.read(reader)).toString()
    log('select: read "%s"', response)
  }

  // We're done
  if (response === protocol) {
    rest()
    return { stream: shakeStream, protocol }
  }

  // We haven't gotten a valid ack, try the other protocols
  for (const protocol of protocols) {
    log('select: write "%s"', protocol)
    multistream.write(writer, protocol)
    const response = (await multistream.read(reader)).toString()
    log('select: read "%s" for "%s"', response, protocol)

    if (response === protocol) {
      rest() // End our writer so others can start writing to stream
      return { stream: shakeStream, protocol }
    }
  }

  rest()
  throw errCode(new Error('protocol selection failed'), 'ERR_UNSUPPORTED_PROTOCOL')
}
