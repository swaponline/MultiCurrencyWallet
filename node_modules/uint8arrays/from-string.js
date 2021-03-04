'use strict'

const { encoding: getCodec } = require('multibase')
const { TextEncoder } = require('web-encoding')
const utf8Encoder = new TextEncoder()

/**
 * @typedef {import('multibase/src/types').BaseName} BaseName
 */

/**
 * Interprets each character in a string as a byte and
 * returns a Uint8Array of those bytes.
 *
 * @param {string} string - The string to turn into an array
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
 * @param {string} string
 * @param {BaseName | 'utf8' | 'utf-8' | 'ascii'} [encoding=utf8] - utf8, base16, base64, base64urlpad, etc
 * @returns {Uint8Array}
 */
function fromString (string, encoding = 'utf8') {
  if (encoding === 'utf8' || encoding === 'utf-8') {
    return utf8Encoder.encode(string)
  }

  if (encoding === 'ascii') {
    return asciiStringToUint8Array(string)
  }

  return getCodec(encoding).decode(string)
}

module.exports = fromString
