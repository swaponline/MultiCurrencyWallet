'use strict'

const tap = require('tap')

const intersection = require('.')

function test (name, check) {
  tap.test(name, assert => {
    check(assert)
    return Promise.resolve()
  })
}

test('returns intersection of two sets', assert => {
  assert.equal(
    [...intersection(new Set('hello'), new Set('world'))].join(''),
    'lo'
  )
})
