'use strict'

try {
  module.exports = require('./native')
} catch (err) {
  module.exports = require('./js')
}
