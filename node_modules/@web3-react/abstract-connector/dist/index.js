
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./abstract-connector.cjs.production.min.js')
} else {
  module.exports = require('./abstract-connector.cjs.development.js')
}
