'use strict'

const randomBytes = require('libp2p-crypto/src/random-bytes')
const uint8ArrayToString = require('uint8arrays/to-string')
const uint8ArrayFromString = require('uint8arrays/from-string')
const PeerId = require('peer-id')
const multihash = require('multihashes')
exports = module.exports

/**
 * Generatea random sequence number.
 *
 * @returns {Uint8Array}
 * @private
 */
exports.randomSeqno = () => {
  return randomBytes(8)
}

/**
 * Generate a message id, based on the `from` and `seqno`.
 *
 * @param {string} from
 * @param {Uint8Array} seqno
 * @returns {Uint8Array}
 * @private
 */
exports.msgId = (from, seqno) => {
  const fromBytes = PeerId.createFromB58String(from).id
  const msgId = new Uint8Array(fromBytes.length + seqno.length)
  msgId.set(fromBytes, 0)
  msgId.set(seqno, fromBytes.length)
  return msgId
}

/**
 * Generate a message id, based on message `data`.
 *
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 * @private
 */
exports.noSignMsgId = (data) => multihash.encode(data, 'sha2-256')

/**
 * Check if any member of the first set is also a member
 * of the second set.
 *
 * @param {Set|Array} a
 * @param {Set|Array} b
 * @returns {boolean}
 * @private
 */
exports.anyMatch = (a, b) => {
  let bHas
  if (Array.isArray(b)) {
    bHas = (val) => b.indexOf(val) > -1
  } else {
    bHas = (val) => b.has(val)
  }

  for (const val of a) {
    if (bHas(val)) {
      return true
    }
  }

  return false
}

/**
 * Make everything an array.
 *
 * @template T
 * @param {T|T[]} maybeArray
 * @returns {T[]}
 * @private
 */
exports.ensureArray = (maybeArray) => {
  if (!Array.isArray(maybeArray)) {
    return [maybeArray]
  }

  return maybeArray
}

/**
 * Ensures `message.from` is base58 encoded
 *
 * @template {{from?:any}} T
 * @param {T & {from?:string, receivedFrom:string}} message
 * @param {string} [peerId]
 * @returns {T & {from?: string, peerId?: string }}
 */
exports.normalizeInRpcMessage = (message, peerId) => {
  const m = Object.assign({}, message)
  if (message.from instanceof Uint8Array) {
    m.from = uint8ArrayToString(message.from, 'base58btc')
  }
  if (peerId) {
    m.receivedFrom = peerId
  }
  return m
}

/**
 * @template {{from?:any, data?:any}} T
 *
 * @param {T} message
 * @returns {T & {from?: Uint8Array, data?: Uint8Array}}
 */
exports.normalizeOutRpcMessage = (message) => {
  const m = Object.assign({}, message)
  if (typeof message.from === 'string') {
    m.from = uint8ArrayFromString(message.from, 'base58btc')
  }
  if (typeof message.data === 'string') {
    m.data = uint8ArrayFromString(message.data)
  }
  return m
}
