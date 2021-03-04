'use strict'

/**
 * Filters the passed (async) iterable by using the filter function
 *
 * @template T
 * @param {AsyncIterable<T>|Iterable<T>} source
 * @param {function(T):boolean|Promise<boolean>} fn
 */
const filter = async function * (source, fn) {
  for await (const entry of source) {
    if (await fn(entry)) {
      yield entry
    }
  }
}

module.exports = filter
