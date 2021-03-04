'use strict'

let impl

if (globalThis.AbortController && globalThis.AbortSignal) {
  impl = globalThis
} else {
  impl = require('abort-controller')
}

module.exports = {
  AbortController: impl.AbortController,
  AbortSignal: impl.AbortSignal
}
