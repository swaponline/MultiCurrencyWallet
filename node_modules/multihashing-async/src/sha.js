/* eslint-disable require-await */
'use strict'
const crypto = require('crypto')
const multihash = require('multihashes')

/**
 * @typedef {import('multihashes').HashName} HashName
 * @typedef {import('./types').Digest} Digest
 */

// Note that although this function doesn't do any asynchronous work, we mark
// the function as async because it must return a Promise to match the API
// for other functions that do perform asynchronous work (see sha.browser.js)
// eslint-disable-next-line

/**
 * @param {Uint8Array} data
 * @param {HashName} alg
 * @returns {Promise<Uint8Array>}
 */
const digest = async (data, alg) => {
  switch (alg) {
    case 'sha1':
      return crypto.createHash('sha1').update(data).digest()
    case 'sha2-256':
      return crypto.createHash('sha256').update(data).digest()
    case 'sha2-512':
      return crypto.createHash('sha512').update(data).digest()
    case 'dbl-sha2-256': {
      const first = crypto.createHash('sha256').update(data).digest()
      return crypto.createHash('sha256').update(first).digest()
    }
    default:
      throw new Error(`${alg} is not a supported algorithm`)
  }
}

module.exports = {
  /**
   * @param {HashName} alg
   * @returns {Digest}
   */
  factory: (alg) => async (data) => {
    return digest(data, alg)
  },
  digest,
  /**
   * @param {Uint8Array} buf
   * @param {HashName} alg
   * @param {number} [length]
   */
  multihashing: async (buf, alg, length) => {
    const h = await digest(buf, alg)
    return multihash.encode(h, alg, length)
  }
}
