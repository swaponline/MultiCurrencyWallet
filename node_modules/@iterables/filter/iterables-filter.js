'use strict'

module.exports = filter

function * filter (iterable, fn) {
  if (!iterable || typeof iterable[Symbol.iterator] !== 'function') {
    throw new TypeError('expected an iterable as the first argument')
  }

  if (typeof fn !== 'function') {
    throw new TypeError('expected second argument to be a function')
  }

  let idx = 0
  for (const value of iterable) {
    if (fn(value, idx++, iterable)) {
      yield value
    }
  }
}
