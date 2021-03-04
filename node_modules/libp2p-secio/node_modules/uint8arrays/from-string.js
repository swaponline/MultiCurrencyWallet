'use strict'

const { names } = require('multibase/src/constants')
const { TextEncoder } = require('web-encoding')
const utf8Encoder = new TextEncoder()

/**
 * Interperets each character in a string as a byte and
 * returns a Uint8Array of those bytes.
 *
 * @param {String} string The string to turn into an array
 * @returns {Uint8Array}
 */
function asciiStringToUint8Array (string) {
  const array = new Uint8Array(string.length)

  for (let i = 0; i < string.length; i++) {
    array[i] = string.charCodeAt(i)
  }

  return array
}

/**
 * Create a `Uint8Array` from the passed string
 *
 * Supports `utf8`, `utf-8` and any encoding supported by the multibase module.
 *
 * Also `ascii` which is similar to node's 'binary' encoding.
 *
 * @param {String} string
 * @param {String} [encoding=utf8] utf8, base16, base64, base64urlpad, etc
 * @returns {Uint8Array}
 * @see {@link https://www.npmjs.com/package/multibase|multibase} for supported encodings other than `utf8`
 */
function fromString (string, encoding = 'utf8') {
  if (encoding === 'utf8' || encoding === 'utf-8') {
    return utf8Encoder.encode(string)
  }

  if (encoding === 'ascii') {
    return asciiStringToUint8Array(string)
  }

  const codec = names[encoding]

  if (!codec) {
    throw new Error('Unknown base')
  }

  return codec.decode(string)
}

module.exports = fromString
