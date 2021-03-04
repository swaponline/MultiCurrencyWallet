'use strict'

const propose = require('./propose')
const exchange = require('./exchange')
const finish = require('./finish')

// Performs initial communication over insecure channel to share keys, IDs,
// and initiate communication, assigning all necessary params.
module.exports = async function handshake (state, wrapped) {
  await propose(state, wrapped)
  await exchange(state, wrapped)
  await finish(state, wrapped)

  state.cleanSecrets()
}
