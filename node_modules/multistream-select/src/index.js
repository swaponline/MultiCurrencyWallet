'use strict'

const select = require('./select')
const handle = require('./handle')
const ls = require('./ls')
const { PROTOCOL_ID } = require('./constants')

exports.PROTOCOL_ID = PROTOCOL_ID

class MultistreamSelect {
  constructor (stream) {
    this._stream = stream
    this._shaken = false
  }

  // Perform the multistream-select handshake
  async _handshake () {
    if (this._shaken) return
    const { stream } = await select(this._stream, PROTOCOL_ID)
    this._stream = stream
    this._shaken = true
  }
}

class Dialer extends MultistreamSelect {
  select (protocols) {
    return select(this._stream, protocols, this._shaken ? null : PROTOCOL_ID)
  }

  async ls () {
    await this._handshake()
    const { stream, protocols } = await ls(this._stream)
    this._stream = stream
    return protocols
  }
}

exports.Dialer = Dialer

class Listener extends MultistreamSelect {
  handle (protocols) {
    return handle(this._stream, protocols)
  }
}

exports.Listener = Listener
