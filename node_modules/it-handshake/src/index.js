'use strict'

const Reader = require('it-reader')
const Writer = require('it-pushable')
const defer = require('p-defer')

// Convert a duplex stream into a reader and writer and rest stream
module.exports = stream => {
  const writer = Writer() // Write bytes on demand to the sink
  const reader = Reader(stream.source) // Read bytes on demand from the source

  // Waits for a source to be passed to the rest stream's sink
  const sourcePromise = defer()
  let sinkErr

  const sinkPromise = stream.sink((async function * () {
    yield * writer
    const source = await sourcePromise.promise
    yield * source
  })())

  sinkPromise.catch(err => {
    sinkErr = err
  })

  const rest = {
    sink: source => {
      if (sinkErr) {
        return Promise.reject(sinkErr)
      }

      sourcePromise.resolve(source)
      return sinkPromise
    },
    source: reader
  }

  return {
    reader,
    writer,
    stream: rest,
    rest: () => writer.end(),
    write: writer.push,
    read: async () => {
      return (await reader.next()).value
    }
  }
}
