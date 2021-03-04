'use strict'

const mh = require('multihashing-async')
const crypto = require('libp2p-crypto')
const uint8ArrayConcat = require('uint8arrays/concat')
const uint8ArrayCompare = require('uint8arrays/compare')

const { InvalidCryptoExchangeError } = require('libp2p-interfaces/src/crypto/errors')

exports.exchanges = [
  'P-256',
  'P-384',
  'P-521'
]

exports.ciphers = [
  'AES-256',
  'AES-128'
]

exports.hashes = [
  'SHA256',
  'SHA512'
]

// Determines which algorithm to use.  Note:  f(a, b) = f(b, a)
exports.theBest = (order, p1, p2) => {
  let first
  let second

  if (order < 0) {
    first = p2
    second = p1
  } else if (order > 0) {
    first = p1
    second = p2
  } else {
    return p1[0]
  }

  for (const firstCandidate of first) {
    for (const secondCandidate of second) {
      if (firstCandidate === secondCandidate) {
        return firstCandidate
      }
    }
  }

  throw new InvalidCryptoExchangeError('No algorithms in common!')
}

exports.makeMacAndCipher = async (target) => {
  [target.mac, target.cipher] = await Promise.all([
    makeMac(target.hashT, target.keys.macKey),
    makeCipher(target.cipherT, target.keys.iv, target.keys.cipherKey)
  ])
}

function makeMac (hash, key) {
  return crypto.hmac.create(hash, key)
}

function makeCipher (cipherType, iv, key) {
  if (cipherType === 'AES-128' || cipherType === 'AES-256') {
    return crypto.aes.create(key, iv)
  }

  // TODO: figure out if Blowfish is needed and if so find a library for it.
  throw new InvalidCryptoExchangeError(`unrecognized cipher type: ${cipherType}`)
}

exports.selectBest = async (local, remote) => {
  const oh1 = await exports.digest(uint8ArrayConcat([
    remote.pubKeyBytes,
    local.nonce
  ]))
  const oh2 = await exports.digest(uint8ArrayConcat([
    local.pubKeyBytes,
    remote.nonce
  ]))

  const order = uint8ArrayCompare(oh1, oh2)

  if (order === 0) {
    throw new InvalidCryptoExchangeError('you are trying to talk to yourself')
  }

  return {
    curveT: exports.theBest(order, local.exchanges, remote.exchanges),
    cipherT: exports.theBest(order, local.ciphers, remote.ciphers),
    hashT: exports.theBest(order, local.hashes, remote.hashes),
    order
  }
}

exports.digest = (buf) => {
  return mh.digest(buf, 'sha2-256', buf.length)
}
