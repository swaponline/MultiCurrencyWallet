'use strict'

const globalThis = require('globalthis')()

if (globalThis.fetch && globalThis.Headers && globalThis.Request && globalThis.Response) {
  module.exports = function fetch (...args) {
    return globalThis.fetch(...args)
  }
  module.exports.Headers = globalThis.Headers
  module.exports.Request = globalThis.Request
  module.exports.Response = globalThis.Response
  module.exports.default = module.exports
} else {
  module.exports = require('node-fetch')
}
