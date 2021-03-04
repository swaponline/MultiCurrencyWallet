
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./walletconnect-connector.cjs.production.min.js')
} else {
  module.exports = require('./walletconnect-connector.cjs.development.js')
}
