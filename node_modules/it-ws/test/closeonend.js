var test = require('tape')
var WebSocket = require('ws')
const { tap, consume } = require('streaming-iterables')
const pipe = require('it-pipe')
var endpoint = require('./helpers/wsurl') + '/echo'
var ws = require('..')

var server = require('./server')()

test('websocket closed when pull source input ends', function (t) {
  var socket = new WebSocket(endpoint)

  pipe(ws.source(socket), consume).then(() => {
    t.end()
  })

  pipe(
    ['x', 'y', 'z'],
    ws(socket, { closeOnEnd: true })
  )
})

test('closeOnEnd=false, stream doesn\'t close', function (t) {
  var socket = new WebSocket(endpoint)

  t.plan(3)
  pipe(
    ws.source(socket),
    tap(function (item) {
      t.ok(item)
    }),
    consume
  )

  pipe(
    ['x', 'y', 'z'],
    ws(socket, { closeOnEnd: false })
  )
})

test('close', function (t) {
  server.close()
  t.end()
})
