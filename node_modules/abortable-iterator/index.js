const getIterator = require('get-iterator')
const AbortError = require('./AbortError')

// Wrap an iterator to make it abortable, allow cleanup when aborted via onAbort
const toAbortableSource = (source, signal, options) => (
  toMultiAbortableSource(source, Array.isArray(signal) ? signal : [{ signal, options }])
)

const toMultiAbortableSource = (source, signals) => {
  source = getIterator(source)
  signals = signals.map(({ signal, options }) => ({ signal, options: options || {} }))

  async function * abortable () {
    let nextAbortHandler
    const abortHandler = () => {
      if (nextAbortHandler) nextAbortHandler()
    }

    for (const { signal } of signals) {
      signal.addEventListener('abort', abortHandler)
    }

    while (true) {
      let result
      try {
        for (const { signal, options } of signals) {
          if (signal.aborted) {
            const { abortMessage, abortCode } = options
            throw new AbortError(abortMessage, abortCode)
          }
        }

        const abort = new Promise((resolve, reject) => {
          nextAbortHandler = () => {
            const { options } = signals.find(({ signal }) => signal.aborted)
            const { abortMessage, abortCode } = options
            reject(new AbortError(abortMessage, abortCode))
          }
        })

        // Race the iterator and the abort signals
        result = await Promise.race([abort, source.next()])
        nextAbortHandler = null
      } catch (err) {
        for (const { signal } of signals) {
          signal.removeEventListener('abort', abortHandler)
        }

        // Might not have been aborted by a known signal
        const aborter = signals.find(({ signal }) => signal.aborted)
        const isKnownAborter = err.type === 'aborted' && aborter

        if (isKnownAborter && aborter.options.onAbort) {
          // Do any custom abort handling for the iterator
          await aborter.options.onAbort(source)
        }

        // End the iterator if it is a generator
        if (typeof source.return === 'function') {
          await source.return()
        }

        if (isKnownAborter && aborter.options.returnOnAbort) {
          return
        }

        throw err
      }

      if (result.done) break
      yield result.value
    }

    for (const { signal } of signals) {
      signal.removeEventListener('abort', abortHandler)
    }
  }

  return abortable()
}

const toAbortableSink = (sink, signal, options) => (
  toMultiAbortableSink(sink, Array.isArray(signal) ? signal : [{ signal, options }])
)

const toMultiAbortableSink = (sink, signals) => source => (
  sink(toMultiAbortableSource(source, signals))
)

const toAbortableDuplex = (duplex, signal, options) => (
  toMultiAbortableDuplex(duplex, Array.isArray(signal) ? signal : [{ signal, options }])
)

const toMultiAbortableDuplex = (duplex, signals) => ({
  sink: toMultiAbortableSink(duplex.sink, signals),
  source: toMultiAbortableSource(duplex.source, signals)
})

module.exports = toAbortableSource
module.exports.AbortError = AbortError
module.exports.source = toAbortableSource
module.exports.sink = toAbortableSink
module.exports.transform = toAbortableSink
module.exports.duplex = toAbortableDuplex
