const toDuplex = require('./duplex')

module.exports = transform => async function * (source) {
  const duplex = toDuplex(transform)
  // In a transform the sink and source are connected, an error in the sink
  // will be thrown in the source also. Catch the sink error to avoid unhandled
  // rejections and yield from the source.
  duplex.sink(source).catch(_ => {})
  yield * duplex.source
}
