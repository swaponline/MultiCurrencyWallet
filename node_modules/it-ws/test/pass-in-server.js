
var WS = require('../')
var tape = require('tape')
const ndjson = require('iterable-ndjson')
const { map, collect } = require('streaming-iterables')
const pipe = require('it-pipe')

tape('simple echo server', async function (t) {
  var httpServer = require('http').createServer()

  var server = WS.createServer({ server: httpServer }, function (stream) {
    pipe(stream, stream)
  })

  await server.listen(5678)

  const stream = WS.connect('ws://localhost:5678')

  const ary = await pipe(
    [1, 2, 3],
    // need a delay, because otherwise ws hangs up wrong.
    // otherwise use pull-goodbye.
    map(val => new Promise(resolve => setTimeout(() => resolve(val), 10))),
    ndjson.stringify,
    stream,
    ndjson.parse,
    collect
  )

  t.deepEqual(ary, [1, 2, 3])
  await server.close()
  t.end()
})
