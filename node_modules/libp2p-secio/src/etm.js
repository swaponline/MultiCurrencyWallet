'use strict'

const BufferList = require('bl/BufferList')
const { InvalidCryptoTransmissionError } = require('libp2p-interfaces/src/crypto/errors')
const uint8ArrayToString = require('uint8arrays/to-string')
const uint8ArrayEquals = require('uint8arrays/equals')

exports.createBoxStream = (cipher, mac) => {
  return async function * (source) {
    for await (const chunk of source) {
      const data = await cipher.encrypt(BufferList.isBufferList(chunk) ? chunk.slice() : chunk)
      const digest = await mac.digest(data)
      yield new BufferList([data, digest])
    }
  }
}

exports.createUnboxStream = (decipher, mac) => {
  return async function * (source) {
    for await (const chunk of source) {
      const l = chunk.length
      const macSize = mac.length

      if (l < macSize) {
        throw new InvalidCryptoTransmissionError(`buffer (${l}) shorter than MAC size (${macSize})`)
      }

      const mark = l - macSize
      const data = chunk.slice(0, mark)
      const macd = chunk.slice(mark)

      const expected = await mac.digest(data)

      if (!uint8ArrayEquals(macd, expected)) {
        throw new InvalidCryptoTransmissionError(`MAC Invalid: ${uint8ArrayToString(macd, 'base16')} != ${uint8ArrayToString(expected, 'base16')}`)
      }

      const decrypted = await decipher.decrypt(data)

      yield decrypted
    }
  }
}
