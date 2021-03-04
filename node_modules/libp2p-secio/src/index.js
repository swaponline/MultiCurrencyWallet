'use strict'

const debug = require('debug')
const log = debug('libp2p:secio')
log.error = debug('libp2p:secio:error')

const handshake = require('./handshake')
const State = require('./state')
const Wrap = require('it-pb-rpc')
const { int32BEDecode, int32BEEncode } = require('it-length-prefixed')

async function secure (localPeer, duplex, remotePeer) { // returns duplex
  if (!localPeer) {
    throw new Error('no local private key provided')
  }
  if (!duplex) {
    throw new Error('no connection for the handshake provided')
  }

  const state = new State(localPeer, remotePeer)
  const wrapped = Wrap(duplex, { lengthDecoder: int32BEDecode, lengthEncoder: int32BEEncode })
  await handshake(state, wrapped)

  return {
    conn: state.secure,
    remotePeer: state.id.remote
  }
}

module.exports = {
  protocol: '/secio/1.0.0',

  // since SECIO is symetric, we only need one function here
  secureInbound: secure,
  secureOutbound: secure
}
