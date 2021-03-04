'use strict'

module.exports.encode = (proto) => {
  return source => (async function * () {
    for await (const msg of source) {
      yield proto.encode(msg)
    }
  })()
}

module.exports.decode = (proto) => {
  return source => (async function * () {
    for await (const msg of source) {
      yield proto.decode(msg)
    }
  })()
}
