'use strict'

const { names } = require('multibase/src/constants')
const { TextDecoder } = require('web-encoding')
const utf8Decoder = new TextDecoder('utf8')

/**
 * Turns a Uint8Array of bytes into a string with each
 * character being the char code of the corresponding byte
 *
 * @param {Uint8Array} array The array to turn into a string
 * @returns {String}
 */
function uint8ArrayToAsciiString (array) {
  let string = ''

  for (let i = 0; i < array.length; i++) {
    string += String.fromCharCode(array[i])
  }
  return string
}

/**
 * Turns a `Uint8Array` into a string.
 *
 * Supports `utf8`, `utf-8` and any encoding supported by the multibase module.
 *
 * Also `ascii` which is similar to node's 'binary' encoding.
 *
 * @param {Uint8Array} array The array to turn into a string
 * @param {String} [encoding=utf8] The encoding to use
 * @returns {String}
 * @see {@link https://www.npmjs.com/package/multibase|multibase} for supported encodings other than `utf8`
 */
function toString (array, encoding = 'utf8') {
  if (encoding === 'utf8' || encoding === 'utf-8') {
    return utf8Decoder.decode(array)
  }

  if (encoding === 'ascii') {
    return uint8ArrayToAsciiString(array)
  }

  const codec = names[encoding]

  if (!codec) {
    throw new Error('Unknown base')
  }

  return codec.encode(array)
}

module.exports = toString
