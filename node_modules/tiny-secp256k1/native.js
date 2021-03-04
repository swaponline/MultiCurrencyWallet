'use strict'

let binding = require('bindings')('secp256k1')
delete binding.path

// NaN drops function names, add them for is* (via toJSON)
for (let key in binding) {
  if (key.indexOf('is') !== 0) continue

  binding[key].toJSON = function () { return key }
}

module.exports = binding
