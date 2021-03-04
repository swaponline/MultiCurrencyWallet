/*
 * Id is an object representation of a peer Id. a peer Id is a multihash
 */

'use strict'

const mh = require('multihashes')
const CID = require('cids')
const cryptoKeys = require('libp2p-crypto/src/keys')
const withIs = require('class-is')
const { PeerIdProto } = require('./proto')
const uint8ArrayEquals = require('uint8arrays/equals')
const uint8ArrayFromString = require('uint8arrays/from-string')
const uint8ArrayToString = require('uint8arrays/to-string')

class PeerId {
  constructor (id, privKey, pubKey) {
    if (!(id instanceof Uint8Array)) {
      throw new Error('invalid id provided')
    }

    if (privKey && pubKey && !uint8ArrayEquals(privKey.public.bytes, pubKey.bytes)) {
      throw new Error('inconsistent arguments')
    }

    this._id = id
    this._idB58String = mh.toB58String(this.id)
    this._privKey = privKey
    this._pubKey = pubKey
  }

  get id () {
    return this._id
  }

  set id (val) {
    throw new Error('Id is immutable')
  }

  get privKey () {
    return this._privKey
  }

  set privKey (privKey) {
    this._privKey = privKey
  }

  get pubKey () {
    if (this._pubKey) {
      return this._pubKey
    }

    if (this._privKey) {
      return this._privKey.public
    }

    try {
      const decoded = mh.decode(this.id)

      if (decoded.name === 'identity') {
        this._pubKey = cryptoKeys.unmarshalPublicKey(decoded.digest)
      }
    } catch (_) {
      // Ignore, there is no valid public key
    }

    return this._pubKey
  }

  set pubKey (pubKey) {
    this._pubKey = pubKey
  }

  // Return the protobuf version of the public key, matching go ipfs formatting
  marshalPubKey () {
    if (this.pubKey) {
      return cryptoKeys.marshalPublicKey(this.pubKey)
    }
  }

  // Return the protobuf version of the private key, matching go ipfs formatting
  marshalPrivKey () {
    if (this.privKey) {
      return cryptoKeys.marshalPrivateKey(this.privKey)
    }
  }

  // Return the protobuf version of the peer-id
  marshal (excludePriv) {
    return PeerIdProto.encode({
      id: this.toBytes(),
      pubKey: this.marshalPubKey(),
      privKey: excludePriv ? null : this.marshalPrivKey()
    })
  }

  toPrint () {
    let pid = this.toB58String()
    // All sha256 nodes start with Qm
    // We can skip the Qm to make the peer.ID more useful
    if (pid.startsWith('Qm')) {
      pid = pid.slice(2)
    }
    let maxRunes = 6
    if (pid.length < maxRunes) {
      maxRunes = pid.length
    }

    return '<peer.ID ' + pid.substr(0, maxRunes) + '>'
  }

  // return the jsonified version of the key, matching the formatting
  // of go-ipfs for its config file
  toJSON () {
    return {
      id: this.toB58String(),
      privKey: toB64Opt(this.marshalPrivKey()),
      pubKey: toB64Opt(this.marshalPubKey())
    }
  }

  // encode/decode functions
  toHexString () {
    return mh.toHexString(this.id)
  }

  toBytes () {
    return this.id
  }

  toB58String () {
    return this._idB58String
  }

  // return self-describing String representation
  // in default format from RFC 0001: https://github.com/libp2p/specs/pull/209
  toString () {
    if (!this._idCIDString) {
      const cid = new CID(1, 'libp2p-key', this.id, 'base32')
      this._idCIDString = cid.toBaseEncodedString('base32')
    }
    return this._idCIDString
  }

  /**
   * Checks the equality of `this` peer against a given PeerId.
   *
   * @param {Uint8Array|PeerId} id
   * @returns {boolean}
   */
  equals (id) {
    if (id instanceof Uint8Array) {
      return uint8ArrayEquals(this.id, id)
    } else if (id.id) {
      return uint8ArrayEquals(this.id, id.id)
    } else {
      throw new Error('not valid Id')
    }
  }

  /**
   * Checks the equality of `this` peer against a given PeerId.
   *
   * @deprecated Use `.equals`
   * @param {Uint8Array|PeerId} id
   * @returns {boolean}
   */
  isEqual (id) {
    return this.equals(id)
  }

  /*
   * Check if this PeerId instance is valid (privKey -> pubKey -> Id)
   */
  isValid () {
    // TODO: needs better checking
    return Boolean(this.privKey &&
      this.privKey.public &&
      this.privKey.public.bytes &&
      this.pubKey.bytes instanceof Uint8Array &&
        uint8ArrayEquals(this.privKey.public.bytes, this.pubKey.bytes))
  }

  /**
   * Check if the PeerId has an inline public key.
   *
   * @returns {boolean}
   */
  hasInlinePublicKey () {
    try {
      const decoded = mh.decode(this.id)
      if (decoded.name === 'identity') {
        return true
      }
    } catch (_) {
      // Ignore, there is no valid public key
    }

    return false
  }
}

const PeerIdWithIs = withIs(PeerId, {
  className: 'PeerId',
  symbolName: '@libp2p/js-peer-id/PeerId'
})

exports = module.exports = PeerIdWithIs

const computeDigest = (pubKey) => {
  if (pubKey.bytes.length <= 42) {
    return mh.encode(pubKey.bytes, 'identity')
  } else {
    return pubKey.hash()
  }
}

const computePeerId = async (privKey, pubKey) => {
  const digest = await computeDigest(pubKey)
  return new PeerIdWithIs(digest, privKey, pubKey)
}

// generation
exports.create = async (opts) => {
  opts = opts || {}
  opts.bits = opts.bits || 2048
  opts.keyType = opts.keyType || 'RSA'

  const key = await cryptoKeys.generateKeyPair(opts.keyType, opts.bits)
  return computePeerId(key, key.public)
}

exports.createFromHexString = (str) => {
  return new PeerIdWithIs(mh.fromHexString(str))
}

exports.createFromBytes = (buf) => {
  return new PeerIdWithIs(buf)
}

exports.createFromB58String = (str) => {
  return exports.createFromCID(str) // B58String is CIDv0
}

const validMulticodec = (cid) => {
  // supported: 'libp2p-key' (CIDv1) and 'dag-pb' (CIDv0 converted to CIDv1)
  return cid.codec === 'libp2p-key' || cid.codec === 'dag-pb'
}

exports.createFromCID = (cid) => {
  cid = CID.isCID(cid) ? cid : new CID(cid)
  if (!validMulticodec(cid)) throw new Error('Supplied PeerID CID has invalid multicodec: ' + cid.codec)
  return new PeerIdWithIs(cid.multihash)
}

// Public Key input will be a Uint8Array
exports.createFromPubKey = async (key) => {
  let buf = key

  if (typeof buf === 'string') {
    buf = uint8ArrayFromString(key, 'base64pad')
  }

  if (!(buf instanceof Uint8Array)) {
    throw new Error('Supplied key is neither a base64 string nor a Uint8Array')
  }

  const pubKey = await cryptoKeys.unmarshalPublicKey(buf)
  return computePeerId(null, pubKey)
}

// Private key input will be a string
exports.createFromPrivKey = async (key) => {
  if (typeof key === 'string') {
    key = uint8ArrayFromString(key, 'base64pad')
  }

  if (!(key instanceof Uint8Array)) {
    throw new Error('Supplied key is neither a base64 string nor a Uint8Array')
  }

  const privKey = await cryptoKeys.unmarshalPrivateKey(key)
  return computePeerId(privKey, privKey.public)
}

exports.createFromJSON = async (obj) => {
  const id = mh.fromB58String(obj.id)
  const rawPrivKey = obj.privKey && uint8ArrayFromString(obj.privKey, 'base64pad')
  const rawPubKey = obj.pubKey && uint8ArrayFromString(obj.pubKey, 'base64pad')
  const pub = rawPubKey && await cryptoKeys.unmarshalPublicKey(rawPubKey)

  if (!rawPrivKey) {
    return new PeerIdWithIs(id, null, pub)
  }

  const privKey = await cryptoKeys.unmarshalPrivateKey(rawPrivKey)
  const privDigest = await computeDigest(privKey.public)

  let pubDigest

  if (pub) {
    pubDigest = await computeDigest(pub)
  }

  if (pub && !uint8ArrayEquals(privDigest, pubDigest)) {
    throw new Error('Public and private key do not match')
  }

  if (id && !uint8ArrayEquals(privDigest, id)) {
    throw new Error('Id and private key do not match')
  }

  return new PeerIdWithIs(id, privKey, pub)
}

exports.createFromProtobuf = async (buf) => {
  if (typeof buf === 'string') {
    buf = uint8ArrayFromString(buf, 'base16')
  }

  let { id, privKey, pubKey } = PeerIdProto.decode(buf)

  privKey = privKey ? await cryptoKeys.unmarshalPrivateKey(privKey) : false
  pubKey = pubKey ? await cryptoKeys.unmarshalPublicKey(pubKey) : false

  let pubDigest
  let privDigest

  if (privKey) {
    privDigest = await computeDigest(privKey.public)
  }

  if (pubKey) {
    pubDigest = await computeDigest(pubKey)
  }

  if (privKey) {
    if (pubKey) {
      if (!uint8ArrayEquals(privDigest, pubDigest)) {
        throw new Error('Public and private key do not match')
      }
    }
    return new PeerIdWithIs(privDigest, privKey, privKey.public)
  }

  // TODO: val id and pubDigest

  if (pubKey) {
    return new PeerIdWithIs(pubDigest, null, pubKey)
  }

  if (id) {
    return new PeerIdWithIs(id)
  }

  throw new Error('Protobuf did not contain any usable key material')
}

exports.isPeerId = (peerId) => {
  return Boolean(typeof peerId === 'object' &&
    peerId._id &&
    peerId._idB58String)
}

function toB64Opt (val) {
  if (val) {
    return uint8ArrayToString(val, 'base64pad')
  }
}
