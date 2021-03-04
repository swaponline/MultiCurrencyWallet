'use strict'

const PeerId = require('peer-id')
const crypto = require('libp2p-crypto')
const debug = require('debug')
const uint8ArrayConcat = require('uint8arrays/concat')
const uint8ArrayEquals = require('uint8arrays/equals')
const uint8ArrayToString = require('uint8arrays/to-string')
const log = debug('libp2p:secio')
log.error = debug('libp2p:secio:error')

const pbm = require('./secio.proto')

const support = require('../support')

const { UnexpectedPeerError } = require('libp2p-interfaces/src/crypto/errors')

// nonceSize is the size of our nonces (in bytes)
const nonceSize = 16

exports.createProposal = (state) => {
  state.proposal.out = {
    rand: crypto.randomBytes(nonceSize),
    pubkey: state.key.local.public.bytes,
    exchanges: support.exchanges.join(','),
    ciphers: support.ciphers.join(','),
    hashes: support.hashes.join(',')
  }

  state.proposalEncoded.out = pbm.Propose.encode(state.proposal.out)
  return state.proposalEncoded.out
}

exports.createExchange = async (state) => {
  const res = await crypto.keys.generateEphemeralKeyPair(state.protocols.local.curveT)

  state.ephemeralKey.local = res.key
  state.shared.generate = res.genSharedKey

  // Gather corpus to sign.
  const selectionOut = uint8ArrayConcat([
    state.proposalEncoded.out,
    state.proposalEncoded.in,
    state.ephemeralKey.local
  ])

  const sig = await state.key.local.sign(selectionOut)

  state.exchange.out = {
    epubkey: state.ephemeralKey.local,
    signature: sig
  }

  return pbm.Exchange.encode(state.exchange.out)
}

exports.identify = async (state, msg) => {
  log('1.1 identify')

  state.proposalEncoded.in = msg
  state.proposal.in = pbm.Propose.decode(msg)
  const pubkey = state.proposal.in.pubkey

  state.key.remote = crypto.keys.unmarshalPublicKey(pubkey)

  const remoteId = await PeerId.createFromPubKey(uint8ArrayToString(pubkey, 'base64pad'))

  // If we know who we are dialing to, double check
  if (state.id.remote) {
    if (state.id.remote.toString() !== remoteId.toString()) {
      throw new UnexpectedPeerError('Dialed to the wrong peer: IDs do not match!')
    }
    state.id.remote.pubKey = state.key.remote
  } else {
    state.id.remote = remoteId
  }

  log('1.1 identify - %s - identified remote peer as %s', state.id.local.toB58String(), state.id.remote.toB58String())
}

exports.selectProtocols = async (state) => {
  log('1.2 selection')

  const local = {
    pubKeyBytes: state.key.local.public.bytes,
    exchanges: support.exchanges,
    hashes: support.hashes,
    ciphers: support.ciphers,
    nonce: state.proposal.out.rand
  }

  const remote = {
    pubKeyBytes: state.proposal.in.pubkey,
    exchanges: state.proposal.in.exchanges.split(','),
    hashes: state.proposal.in.hashes.split(','),
    ciphers: state.proposal.in.ciphers.split(','),
    nonce: state.proposal.in.rand
  }

  const selected = await support.selectBest(local, remote)

  // we use the same params for both directions (must choose same curve)
  // WARNING: if they dont SelectBest the same way, this won't work...
  state.protocols.remote = {
    order: selected.order,
    curveT: selected.curveT,
    cipherT: selected.cipherT,
    hashT: selected.hashT
  }

  state.protocols.local = {
    order: selected.order,
    curveT: selected.curveT,
    cipherT: selected.cipherT,
    hashT: selected.hashT
  }
}

exports.verify = async (state, msg) => {
  log('2.1. verify')

  state.exchange.in = pbm.Exchange.decode(msg)
  state.ephemeralKey.remote = state.exchange.in.epubkey

  const selectionIn = uint8ArrayConcat([
    state.proposalEncoded.in,
    state.proposalEncoded.out,
    state.ephemeralKey.remote
  ])

  const sigOk = await state.key.remote.verify(selectionIn, state.exchange.in.signature)

  if (!sigOk) {
    throw new Error('Bad signature')
  }

  log('2.1. verify - signature verified')
}

exports.generateKeys = async (state) => {
  log('2.2. keys')

  const secret = await state.shared.generate(state.exchange.in.epubkey)

  state.shared.secret = secret

  const keys = await crypto.keys.keyStretcher(
    state.protocols.local.cipherT,
    state.protocols.local.hashT,
    state.shared.secret)

  // use random nonces to decide order.
  if (state.protocols.local.order > 0) {
    state.protocols.local.keys = keys.k1
    state.protocols.remote.keys = keys.k2
  } else if (state.protocols.local.order < 0) {
    // swap
    state.protocols.local.keys = keys.k2
    state.protocols.remote.keys = keys.k1
  } else {
    // we should've bailed before state. but if not, bail here.
    throw new Error('you are trying to talk to yourself')
  }

  log('2.3. mac + cipher')

  await Promise.all([state.protocols.local, state.protocols.remote].map(data => support.makeMacAndCipher(data)))
}

exports.verifyNonce = (state, n2) => {
  const n1 = state.proposal.out.rand

  if (uint8ArrayEquals(n1, n2)) return

  throw new Error(
    `Failed to read our encrypted nonce: ${uint8ArrayToString(n1, 'base16')} != ${uint8ArrayToString(n2, 'base16')}`
  )
}
