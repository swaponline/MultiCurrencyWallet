'use strict'

// Electron has `XMLHttpRequest` and should get the browser implementation
// instead of node.
if (typeof XMLHttpRequest === 'function') {
  module.exports = require('./fetch.browser')
} else {
  module.exports = require('./fetch.node')
}
