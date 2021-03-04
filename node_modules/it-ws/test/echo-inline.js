var WS = require('../')
var tape = require('tape')
var ndjson = require('iterable-ndjson')
const { map, collect } = require('streaming-iterables')
const pipe = require('it-pipe')

tape('simple echo server', async function (t) {
  var server = await WS.createServer(function (stream) {
    pipe(stream, stream)
  }).listen(5678)

  const ary = await pipe(
    [1, 2, 3],
    // need a delay, because otherwise ws hangs up wrong.
    // otherwise use pull-goodbye.
    map(val => new Promise(resolve => setTimeout(() => resolve(val), 10))),
    ndjson.stringify,
    WS.connect('ws://localhost:5678'),
    ndjson.parse,
    collect
  )

  t.deepEqual(ary, [1, 2, 3])
  await server.close()
  t.end()
})
