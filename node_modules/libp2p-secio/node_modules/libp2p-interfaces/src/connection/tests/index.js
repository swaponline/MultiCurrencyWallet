/* eslint-env mocha */

'use strict'

const connectionSuite = require('./connection')

module.exports = (test) => {
  connectionSuite(test)
}
