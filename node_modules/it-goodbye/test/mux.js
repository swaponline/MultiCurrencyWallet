var tape = require('tape')
var pull = require('pull-stream')
var mux = require('muxrpc')
const toPull = require('async-iterator-to-pull-stream')
var goodbye = require('../')

var client = {
  hello: 'async',
  goodbye: 'async',
  stuff: 'source',
  bstuff: 'source',
  things: 'sink',
  suchstreamwow: 'duplex'
}

tape('duplex', function (t) {
  var A = mux(client, null)()
  var B = mux(null, client)({
    suchstreamwow: function (someParam) {
      // did the param come through?
      t.equal(someParam, 5)

      return toPull.duplex(goodbye({
        source: [1, 2, 3, 4, 5],
        sink: async source => {
          const values = []
          for await (const value of source) {
            values.push(value)
          }
          t.deepEqual(values, [1, 2, 3, 4, 5])
          t.end()
        }
      }, 6))
    }
  })

  var s = A.createStream()
  pull(
    s,
    pull.through(console.log.bind(console, 'IN')),
    B.createStream(),
    pull.through(console.log.bind(console, 'OUT')),
    s
  )
  var dup = A.suchstreamwow(5)
  pull(dup, dup)
})
