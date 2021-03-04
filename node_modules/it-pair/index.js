'use strict'

const getIterator = require('get-iterator')

// a pair of streams where one drains from the other
module.exports = function pair () {
  let _source, onSource

  const sink = async source => {
    if (_source) throw new Error('already piped')
    _source = getIterator(source)
    if (onSource) onSource(_source)
  }

  const source = {
    [Symbol.asyncIterator] () {
      return this
    },
    next () {
      if (_source) return _source.next()
      return new Promise(resolve => {
        onSource = source => {
          onSource = null
          resolve(source.next())
        }
      })
    }
  }

  return { sink, source }
}
