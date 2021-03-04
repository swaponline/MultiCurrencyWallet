'use strict'

if (globalThis.fetch && globalThis.Headers && globalThis.Request && globalThis.Response) {
  module.exports = {
    default: globalThis.fetch,
    Headers: globalThis.Headers,
    Request: globalThis.Request,
    Response: globalThis.Response
  }
} else {
  module.exports = {
    default: require('node-fetch').default,
    Headers: require('node-fetch').Headers,
    Request: require('node-fetch').Request,
    Response: require('node-fetch').Response
  }
}
