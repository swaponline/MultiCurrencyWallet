module.exports = readable => {
  // Node.js stream
  if (readable[Symbol.asyncIterator]) return readable

  // Browser ReadableStream
  if (readable.getReader) {
    return (async function * () {
      const reader = readable.getReader()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) return
          yield value
        }
      } finally {
        reader.releaseLock()
      }
    })()
  }

  throw new Error('unknown stream')
}
