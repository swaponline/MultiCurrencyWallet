'use strict'

/**
 * Stop iteration after n items have been received.
 *
 * @template T
 * @param {AsyncIterable<T>|Iterable<T>} source
 * @param {number} limit
 * @returns {AsyncIterable<T>}
 */
const take = async function * (source, limit) {
  let items = 0

  if (limit < 1) {
    return
  }

  for await (const entry of source) {
    yield entry

    items++

    if (items === limit) {
      return
    }
  }
}

module.exports = take
