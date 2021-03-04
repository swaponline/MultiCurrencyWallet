'use strict'

const crypto = require('./crypto')
const lp = require('it-length-prefixed')
const { int32BEEncode } = lp
const debug = require('debug')
const log = debug('libp2p:secio')
log.error = debug('libp2p:secio:error')

// step 1. Propose
// -- propose cipher suite + send pubkeys + nonce
module.exports = async function propose (state, wrapped) {
  log('1. propose - start')

  const prop = crypto.createProposal(state)
  log('1. propose - writing proposal', prop)

  await wrapped.write(lp.encode.single(prop, { lengthEncoder: int32BEEncode }))

  log('1. propose - reading proposal')
  const msg = (await wrapped.readLP()).slice()
  log('1. propose - read proposal', msg)

  await crypto.identify(state, msg)
  await crypto.selectProtocols(state)

  log('1. propose - finish')
}
