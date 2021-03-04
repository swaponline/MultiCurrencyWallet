/* eslint-env mocha */
'use strict'

const apiTest = require('./api')
const emitSelfTest = require('./emit-self')
const messagesTest = require('./messages')
const twoNodesTest = require('./two-nodes')
const multipleNodesTest = require('./multiple-nodes')

module.exports = (common) => {
  describe('interface-pubsub', () => {
    apiTest(common)
    emitSelfTest(common)
    messagesTest(common)
    twoNodesTest(common)
    multipleNodesTest(common)
  })
}
