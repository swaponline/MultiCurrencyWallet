/* eslint-env mocha */
'use strict'

const baseTest = require('./base-test')
const stressTest = require('./stress-test')
const megaStressTest = require('./mega-stress-test')
const isNode = require('detect-node')

module.exports = (common) => {
  describe('interface-stream-muxer', () => {
    baseTest(common)
    if (isNode) {
      const closeTest = require('./close-test')
      closeTest(common)
    }
    stressTest(common)
    megaStressTest(common)
  })
}
