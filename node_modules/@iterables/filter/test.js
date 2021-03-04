'use strict'

const tap = require('tap')

const filter = require('./iterables-filter')

function test (name, testCase) {
  return tap.test(name, assert => {
    testCase(assert)
    return Promise.resolve()
  })
}

test('fails if falsey iterable given', assert => {
  assert.throws(TypeError, () => {
    Array.from(filter(null))
  })
  assert.throws(TypeError, () => {
    Array.from(filter(false))
  })
  assert.throws(TypeError, () => {
    Array.from(filter(0))
  })
})

test('fails if non-iterable given', assert => {
  assert.throws(TypeError, () => {
    Array.from(filter({[Symbol.iterable]: null}))
  })
  assert.throws(TypeError, () => {
    Array.from(filter(true))
  })
  assert.throws(TypeError, () => {
    Array.from(filter(1))
  })
})

test('fails if non-function given as second arg', assert => {
  assert.throws(TypeError, () => {
    Array.from(filter([]))
  })
  assert.throws(TypeError, () => {
    Array.from(filter([]), true)
  })
  assert.throws(TypeError, () => {
    Array.from(filter([]), {})
  })
})

test('it calls the function on every element', assert => {
  assert.deepEqual(Array.from(filter([1, 2, 3], xs => xs * 2)), [
    1,
    2,
    3
  ])
})

test('it calls the function with idx on every element', assert => {
  const indices = []
  assert.deepEqual(Array.from(filter([1, 2, 3], (_, idx) => indices.push(idx))), [
    1,
    2,
    3
  ])
  assert.deepEqual(indices, [0, 1, 2])
})

test('it calls the function with all on every element', assert => {
  const arr = [1, 2, 3]
  const alls = []
  Array.from(filter(arr, (_0, _1, all) => alls.push(all)))
  assert.deepEqual(alls, [
    arr,
    arr,
    arr
  ])
})

test('it filters false-y results', assert => {
  assert.deepEqual(Array.from(filter([1, 0, 2, 3], Boolean)), [
    1,
    2,
    3
  ])
})
