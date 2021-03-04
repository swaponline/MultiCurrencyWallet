'use strict'

const tap = require('tap')

const count = require('@iterables/count')
const take = require('@iterables/take')

const chain = require('./iterables-chain')

function test (name, testCase) {
  return tap.test(name, assert => {
    testCase(assert)
    return Promise.resolve()
  })
}

test('fails if falsey iterable given', assert => {
  assert.throws(TypeError, () => {
    Array.from(chain(null))
  })
  assert.throws(TypeError, () => {
    Array.from(chain(false))
  })
  assert.throws(TypeError, () => {
    Array.from(chain(0))
  })
})

test('fails if non-iterable given', assert => {
  assert.throws(TypeError, () => {
    Array.from(chain({[Symbol.iterator]: null}))
  })
})

test('chains multiple iterators', assert => {
  assert.deepEqual([...chain(
    [1, 2, 3],
    new Set([4, 5, 6])
  )], [...take(count(1), 6)])
})
