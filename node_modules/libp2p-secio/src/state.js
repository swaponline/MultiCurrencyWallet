'use strict'

class State {
  constructor (localId, remoteId) {
    this.setup()

    this.id.local = localId
    this.id.remote = remoteId
    this.key.local = localId.privKey
  }

  setup () {
    this.id = { local: null, remote: null }
    this.key = { local: null, remote: null }
    this.shake = null
    this.cleanSecrets()
  }

  // remove all data from the handshake that is not needed anymore
  cleanSecrets () {
    this.shared = {}

    this.ephemeralKey = { local: null, remote: null }
    this.proposal = { in: null, out: null }
    this.proposalEncoded = { in: null, out: null }
    this.protocols = { local: null, remote: null }
    this.exchange = { in: null, out: null }
  }
}

module.exports = State
