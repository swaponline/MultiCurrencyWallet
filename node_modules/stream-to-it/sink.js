const getIterator = require('get-iterator')

module.exports = writable => async source => {
  source = getIterator(source)

  const maybeEndSource = (source) => {
    if (typeof source.return === 'function') source.return()
  }

  let error = null
  let errCb = null
  const errorHandler = (err) => {
    error = err
    if (errCb) errCb(err)
    // When the writable errors, try to end the source to exit iteration early
    maybeEndSource(source)
  }

  let closeCb = null
  let closed = false
  const closeHandler = () => {
    closed = true
    if (closeCb) closeCb()
  }

  let finishCb = null
  let finished = false
  const finishHandler = () => {
    finished = true
    if (finishCb) finishCb()
  }

  let drainCb = null
  const drainHandler = () => {
    if (drainCb) drainCb()
  }

  const waitForDrainOrClose = () => {
    return new Promise((resolve, reject) => {
      closeCb = drainCb = resolve
      errCb = reject
      writable.once('drain', drainHandler)
    })
  }

  const waitForDone = () => {
    // Immediately try to end the source
    maybeEndSource(source)
    return new Promise((resolve, reject) => {
      if (closed || finished || error) return resolve()
      finishCb = closeCb = resolve
      errCb = reject
    })
  }

  const cleanup = () => {
    writable.removeListener('error', errorHandler)
    writable.removeListener('close', closeHandler)
    writable.removeListener('finish', finishHandler)
    writable.removeListener('drain', drainHandler)
  }

  writable.once('error', errorHandler)
  writable.once('close', closeHandler)
  writable.once('finish', finishHandler)

  try {
    for await (const value of source) {
      if (!writable.writable || writable.destroyed || error) break

      if (writable.write(value) === false) {
        await waitForDrainOrClose()
      }
    }
  } catch (err) {
    // error is set by stream error handler so only destroy stream if source threw
    if (!error) {
      writable.destroy()
    }

    // could we be obscuring an error here?
    error = err
  }

  try {
    // We're done writing, end everything (n.b. stream may be destroyed at this point but then this is a no-op)
    if (writable.writable) {
      writable.end()
    }

    // Wait until we close or finish. This supports halfClosed streams
    await waitForDone()

    // Notify the user an error occurred
    if (error) throw error
  } finally {
    // Clean up listeners
    cleanup()
  }
}
