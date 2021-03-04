const test = require('ava')
const { Readable } = require('stream')
const { Buffer } = require('buffer')
const toStream = require('../')
const { collect } = require('./helpers/streams')
const { randomInt, randomBytes } = require('./helpers/random')

test('should convert to transform stream', async t => {
  const input = Array.from(Array(randomInt(5, 10)), () => randomBytes(1, 512))
  let i = 0

  const suffix = Buffer.from(`${Date.now()}`)

  const output = await collect(
    new Readable({
      read (size) {
        let chunk = input[i]
        while (true) {
          if (!chunk) return this.push(null)
          i++
          if (!this.push(chunk)) return
          chunk = input[i]
        }
      }
    }),
    // Transform every chunk to have a "suffix"
    toStream.transform(source => (async function * () {
      for await (const chunk of source) {
        yield Buffer.concat([chunk, suffix])
      }
    })())
  )

  t.is(output.length, input.length)

  input.forEach((inputBuffer, i) => {
    t.deepEqual(Buffer.concat([inputBuffer, suffix]), output[i])
  })
})

test('should transform single chunk into multiple chunks', async t => {
  const input = Array.from(Array(randomInt(5, 10)), () => randomBytes(1, 512))
  let i = 0

  const separator = Buffer.from(`${Date.now()}`)

  const output = await collect(
    new Readable({
      read (size) {
        let chunk = input[i]
        while (true) {
          if (!chunk) return this.push(null)
          i++
          if (!this.push(chunk)) return
          chunk = input[i]
        }
      }
    }),
    // Add a separator after every chunk
    toStream.transform(source => (async function * () {
      for await (const chunk of source) {
        yield chunk
        yield separator
      }
    })())
  )

  t.is(output.length, input.length * 2)
})

test('should transform single chunk into no chunks', async t => {
  const input = Array.from(Array(randomInt(5, 10)), () => randomBytes(1, 512))
  let i = 0

  const output = await collect(
    new Readable({
      read (size) {
        let chunk = input[i]
        while (true) {
          if (!chunk) return this.push(null)
          i++
          if (!this.push(chunk)) return
          chunk = input[i]
        }
      }
    }),
    toStream.transform(source => (async function * () {
      // eslint-disable-next-line no-unused-vars
      for await (const chunk of source) {}
    })())
  )

  t.is(output.length, 0)
})

test('should error the stream when transform iterator errors', async t => {
  const input = Array.from(Array(randomInt(5, 10)), () => randomBytes(1, 512))
  let i = 0

  const err = await t.throwsAsync(collect(
    new Readable({
      read (size) {
        let chunk = input[i]
        while (true) {
          if (!chunk) return this.push(null)
          i++
          if (!this.push(chunk)) return
          chunk = input[i]
        }
      }
    }),
    toStream.transform(source => (async function * () {
      // eslint-disable-next-line no-unused-vars
      for await (const chunk of source) {
        if (i > 2) throw new Error('boom')
      }
    })())
  ))

  t.is(err.message, 'boom')
})
