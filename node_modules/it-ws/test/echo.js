var test = require('tape')
var WebSocket = require('ws')
var ws = require('..')
var url = require('./helpers/wsurl') + '/echo'
const { tap, consume } = require('streaming-iterables')
const pipe = require('it-pipe')
const goodbye = require('it-goodbye')

var server = require('./server')()

test('setup echo reading and writing', function (t) {
  var socket = new WebSocket(url)
  var expected = ['x', 'y', 'z']

  t.plan(expected.length)

  pipe(
    ws.source(socket),
    tap(function (value) {
      console.log(value)
      t.equal(value, expected.shift())
    }),
    consume
  )

  pipe(
    [].concat(expected),
    ws.sink(socket, { closeOnEnd: false })
  )
})

test('duplex style', function (t) {
  var expected = ['x', 'y', 'z']
  var socket = new WebSocket(url)

  t.plan(expected.length)

  pipe(
    [].concat(expected),
    ws(socket, { closeOnEnd: false }),
    tap(function (value) {
      console.log('echo:', value)
      t.equal(value, expected.shift())
    }),
    consume
  )
})

test('duplex with goodbye handshake', async function (t) {
  var expected = ['x', 'y', 'z']
  var socket = new WebSocket(url)

  var pws = ws(socket)

  await pipe(
    pws,
    goodbye({
      source: [].concat(expected),
      sink: source => pipe(
        source,
        tap(value => t.equal(value.toString(), expected.shift())),
        consume
      )
    }),
    pws
  )

  t.end()
})

test('close', function (t) {
  server.close()
  t.end()
})
