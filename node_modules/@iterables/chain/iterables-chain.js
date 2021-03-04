'use strict'

module.exports = chain

function * chain () {
  const iterators = Array.from(arguments)
  for (var i = 0; i < iterators.length; ++i) {
    if (!iterators[i] || typeof iterators[i][Symbol.iterator] !== 'function') {
      throw new TypeError(`expected argument ${i} to be an iterable`)
    }
  }

  for (const iter of iterators) {
    yield * iter
  }
}
