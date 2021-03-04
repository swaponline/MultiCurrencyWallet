'use strict'

class AbortError extends Error {
  constructor () {
    super('The operation was aborted')
    this.code = AbortError.code
    this.type = AbortError.type
  }

  static get code () {
    return 'ABORT_ERR'
  }

  static get type () {
    return 'aborted'
  }
}

module.exports = {
  AbortError
}
