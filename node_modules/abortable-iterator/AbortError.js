module.exports = class AbortError extends Error {
  constructor (message, code) {
    super(message || 'The operation was aborted')
    this.type = 'aborted'
    this.code = code || 'ABORT_ERR'
  }
}
