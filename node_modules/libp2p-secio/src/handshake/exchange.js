'use strict'

const crypto = require('./crypto')

const debug = require('debug')
const log = debug('libp2p:secio')
log.error = debug('libp2p:secio:error')

// step 2. Exchange
// -- exchange (signed) ephemeral keys. verify signatures.
module.exports = async function exchange (state, wrapped) {
  log('2. exchange - start')

  log('2. exchange - writing exchange')
  const ex = await crypto.createExchange(state)

  await wrapped.writeLP(ex)
  const msg = await wrapped.readLP()

  log('2. exchange - reading exchange')
  await crypto.verify(state, msg.slice())

  await crypto.generateKeys(state)
  log('2. exchange - finish')
}
