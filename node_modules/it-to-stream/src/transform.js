const toDuplex = require('./duplex')
const defer = require('p-defer')

module.exports = function toTransform (transform, options) {
  const { promise, resolve } = defer()

  const source = (async function * () {
    const it = await promise
    for await (const chunk of it) yield chunk
  })()

  return toDuplex({ sink: s => resolve(transform(s)), source }, options)
}
