const test = require('ava')
const { Writable } = require('stream')
const toStream = require('../')
const { collect, pipe } = require('./helpers/streams')
const { randomInt, randomBytes } = require('./helpers/random')

test('should convert to readable stream', async t => {
  const input = Array.from(Array(randomInt(5, 10)), () => randomBytes(1, 512))
  const output = await collect(toStream.readable(input, { objectMode: true }))
  t.deepEqual(input, output)
})

test('should error the stream when source iterator errors', async t => {
  const input = (async function * () {
    yield randomBytes(1, 1024)
    yield randomBytes(1, 1024)
    throw new Error('boom')
  })()

  const err = await t.throwsAsync(collect(toStream.readable(input)))
  t.is(err.message, 'boom')
})

test('should respect backpressure', async t => {
  const input = Array.from(Array(randomInt(10, 100)), () => randomBytes(1, 512))
  const chunks = []

  await pipe(
    toStream.readable(input, {
      highWaterMark: 1,
      objectMode: true
    }),
    new Writable({
      highWaterMark: 1,
      objectMode: true,
      write (chunk, enc, cb) {
        chunks.push(chunk)
        setTimeout(() => cb(null, chunk), 10)
      }
    })
  )
  t.deepEqual(chunks, input)
})
