var test = require('tape')
var WebSocket = require('ws')
const { consume } = require('streaming-iterables')
const pipe = require('it-pipe')
var ws = require('../')

var server = require('./server')()

// connect to a server that does not exist, and check that it errors.
// should pass the error to both sides of the stream.
test('test error', async function (t) {
  let _err
  try {
    await pipe(
      ['x', 'y', 'z'],
      source => {
        const stream = ws(new WebSocket('ws://localhost:34897/' + Math.random()))
        stream.sink(source).catch(err => {
          if (_err) {
            t.strictEqual(err.message, _err.message)
            t.end()
          }
          _err = err
        })
        return stream.source
      },
      source => {
        return (async function * () {
          try {
            for await (const val of source) yield val
          } catch (err) {
            if (_err) {
              t.strictEqual(err.message, _err.message)
              t.end()
            }
            _err = err
          }
        })()
      },
      consume
    )
  } catch (err) {
    t.ok(err)
    t.end()
  }
})

test('test connection error awaiting connected', async function (t) {
  try {
    await ws(new WebSocket('ws://localhost:34897/' + Math.random())).connected()
  } catch (err) {
    t.ok(err.message.includes('ECONNREFUSED'))
    t.end()
  }
})

test('test connection error in stream', async function (t) {
  try {
    await pipe(
      ws(new WebSocket('ws://localhost:34897/' + Math.random())).source,
      consume
    )
  } catch (err) {
    t.ok(err.message.includes('ECONNREFUSED'))
    t.end()
  }
})

test('close', function (t) {
  server.close()
  t.end()
})
