'use strict'

const errcode = require('err-code')
const multihash = require('multihashes')
const crypto = require('./crypto')
const equals = require('uint8arrays/equals')

/**
 * @typedef {import("./types").Digest} Digest
 * @typedef {import("multihashes").HashName} HashName
 */

/**
 * Hash the given `bytes` using the algorithm specified by `alg`.
 *
 * @param {Uint8Array} bytes - The value to hash.
 * @param {HashName} alg - The algorithm to use eg 'sha1'
 * @param {number} [length] - Optionally trim the result to this length.
 * @returns {Promise<Uint8Array>}
 */
async function Multihashing (bytes, alg, length) {
  const digest = await Multihashing.digest(bytes, alg, length)
  return multihash.encode(digest, alg, length)
}

/**
 * Expose multihash itself, to avoid silly double requires.
 */
Multihashing.multihash = multihash

/**
 * @param {Uint8Array} bytes - The value to hash.
 * @param {HashName} alg - The algorithm to use eg 'sha1'
 * @param {number} [length] - Optionally trim the result to this length.
 * @returns {Promise<Uint8Array>}
 */
Multihashing.digest = async (bytes, alg, length) => {
  const hash = Multihashing.createHash(alg)
  const digest = await hash(bytes)
  return length ? digest.slice(0, length) : digest
}

/**
 * Creates a function that hashes with the given algorithm
 *
 * @param {HashName} alg - The algorithm to use eg 'sha1'
 * @returns {Digest} - The hash function corresponding to `alg`
 */
Multihashing.createHash = function (alg) {
  if (!alg) {
    const e = errcode(new Error('hash algorithm must be specified'), 'ERR_HASH_ALGORITHM_NOT_SPECIFIED')
    throw e
  }

  const code = multihash.coerceCode(alg)
  if (!Multihashing.functions[code]) {
    throw errcode(new Error(`multihash function '${alg}' not yet supported`), 'ERR_HASH_ALGORITHM_NOT_SUPPORTED')
  }

  return Multihashing.functions[code]
}

/**
 * Mapping of multihash codes to their hashing functions.
 *
 * @type {Record<number, Digest>}
 */
// @ts-ignore - most of those functions aren't typed
Multihashing.functions = {
  // identity
  0x00: crypto.identity,
  // sha1
  0x11: crypto.sha1,
  // sha2-256
  0x12: crypto.sha2256,
  // sha2-512
  0x13: crypto.sha2512,
  // sha3-512
  0x14: crypto.sha3512,
  // sha3-384
  0x15: crypto.sha3384,
  // sha3-256
  0x16: crypto.sha3256,
  // sha3-224
  0x17: crypto.sha3224,
  // shake-128
  0x18: crypto.shake128,
  // shake-256
  0x19: crypto.shake256,
  // keccak-224
  0x1A: crypto.keccak224,
  // keccak-256
  0x1B: crypto.keccak256,
  // keccak-384
  0x1C: crypto.keccak384,
  // keccak-512
  0x1D: crypto.keccak512,
  // murmur3-128
  0x22: crypto.murmur3128,
  // murmur3-32
  0x23: crypto.murmur332,
  // dbl-sha2-256
  0x56: crypto.dblSha2256
}

// add blake functions
crypto.addBlake(Multihashing.functions)

/**
 * @param {Uint8Array} bytes
 * @param {Uint8Array} hash
 * @returns {Promise<boolean>}
 */
Multihashing.validate = async (bytes, hash) => {
  const newHash = await Multihashing(bytes, multihash.decode(hash).name)

  return equals(hash, newHash)
}

module.exports = Multihashing
