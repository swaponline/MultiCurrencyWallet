const BufferList = require('bl/BufferList')

module.exports = source => {
  const reader = (async function * () {
    let bytes = yield // Allows us to receive 8 when reader.next(8) is called
    let bl = new BufferList()

    for await (const chunk of source) {
      if (!bytes) {
        bytes = yield bl.append(chunk)
        bl = new BufferList()
        continue
      }

      bl.append(chunk)

      while (bl.length >= bytes) {
        const data = bl.shallowSlice(0, bytes)
        bl.consume(bytes)
        bytes = yield data

        // If we no longer want a specific byte length, we yield the rest now
        if (!bytes) {
          if (bl.length) {
            bytes = yield bl
            bl = new BufferList()
          }
          break // bytes is null and/or no more buffer to yield
        }
      }
    }

    // Consumer wants more bytes but the source has ended and our buffer
    // is not big enough to satisfy.
    if (bytes) {
      throw Object.assign(
        new Error(`stream ended before ${bytes} bytes became available`),
        { code: 'ERR_UNDER_READ', buffer: bl }
      )
    }
  })()

  reader.next()
  return reader
}
