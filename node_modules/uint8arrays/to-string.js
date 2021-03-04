'use strict'

const { encoding: getCodec } = require('multibase')
const { TextDecoder } = require('web-encoding')
const utf8Decoder = new TextDecoder('utf8')

/**
 * @typedef {import('multibase/src/types').BaseName} BaseName
 */

/**
 * Turns a Uint8Array of bytes into a string with each
 * character being the char code of the corresponding byte
 *
 * @param {Uint8Array} array - The array to turn into a string
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
 * @param {Uint8Array} array - The array to turn into a string
 * @param {BaseName | 'utf8' | 'utf-8' | 'ascii'} [encoding=utf8] - The encoding to use
 * @returns {string}
 */
function toString (array, encoding = 'utf8') {
  if (encoding === 'utf8' || encoding === 'utf-8') {
    return utf8Decoder.decode(array)
  }

  if (encoding === 'ascii') {
    return uint8ArrayToAsciiString(array)
  }

  return getCodec(encoding).encode(array)
}

module.exports = toString
