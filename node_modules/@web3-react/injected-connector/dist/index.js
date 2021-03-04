
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./injected-connector.cjs.production.min.js')
} else {
  module.exports = require('./injected-connector.cjs.development.js')
}
