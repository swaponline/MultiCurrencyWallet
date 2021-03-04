'use strict'

/**
 * @param {number} number
 * @returns {Uint8Array}
 */
const fromNumberTo32BitBuf = (number) => {
  const bytes = new Uint8Array(4)

  for (let i = 0; i < 4; i++) {
    bytes[i] = number & 0xff
    number = number >> 8
  }

  return bytes
}

module.exports = {
  fromNumberTo32BitBuf
}
