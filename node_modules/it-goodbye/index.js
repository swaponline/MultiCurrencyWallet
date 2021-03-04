const { Buffer } = require('buffer')
const endable = require('./endable')

module.exports = (stream, goodbye) => {
  goodbye = goodbye || Buffer.from('GOODBYE')
  const e = endable(goodbye)
  const isBufferCompatible = Buffer.isBuffer(goodbye) || typeof goodbye === 'string'
  const token = isBufferCompatible ? Buffer.from(goodbye) : goodbye

  return {
    // when the source ends,
    // send the goodbye and then wait to recieve
    // the other goodbye.
    source: e(stream.source),
    sink: source => stream.sink((async function * () {
      // when the goodbye is received, allow the source to end.
      if (isBufferCompatible) {
        for await (const chunk of source) {
          const buff = Buffer.from(chunk)
          const done = buff.slice(-token.length).equals(token)
          if (done) {
            const remaining = buff.length - token.length
            if (remaining > 0) {
              yield buff.slice(0, remaining)
            }
            e.end()
          } else {
            yield buff
          }
        }
      } else {
        for await (const chunk of source) {
          if (chunk === goodbye) {
            e.end()
          } else {
            yield chunk
          }
        }
      }
    })())
  }
}
