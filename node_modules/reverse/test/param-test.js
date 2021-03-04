'use strict'

const reverse = require('..')
const tap = require('tap')

tap.test('invalid param function should throw', assert => {
  assert.throws(() => reverse.param('anything', {}))
  assert.throws(() => reverse.param('anything', {validate: 1}))
  assert.throws(() => reverse.param('anything', 12))
  assert.throws(() => reverse.param('anything', true))
  assert.throws(() => reverse.param('anything', null))
  assert.end()
})
