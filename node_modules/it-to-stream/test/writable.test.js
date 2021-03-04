const test = require('ava')
const { Readable } = require('stream')
const toStream = require('../')
const { pipe } = require('./helpers/streams')
const { randomInt, randomBytes } = require('./helpers/random')

test('should convert to writable stream', async t => {
  const input = Array.from(Array(randomInt(5, 10)), () => randomBytes(1, 512))
  const output = []
  let i = 0

  await pipe(
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
    toStream.writable(async source => {
      for await (const chunk of source) {
        output.push(chunk)
      }
    })
  )

  t.deepEqual(output, input)
})

test('should end mid stream', async t => {
  const input = Array.from(Array(randomInt(5, 10)), () => randomBytes(1, 512))
  const output = []
  let i = 0

  await pipe(
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
    toStream.writable(async source => {
      for await (const chunk of source) {
        output.push(chunk)
        break
      }
    })
  )

  t.deepEqual(output, input.slice(0, 1))
})

test('should throw mid stream', async t => {
  const input = Array.from(Array(randomInt(5, 10)), () => randomBytes(1, 512))
  const output = []
  let i = 0

  const err = await t.throwsAsync(pipe(
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
    toStream.writable(async source => {
      const { value } = await source.next()
      output.push(value)
      await source.throw(new Error('boom!'))
    })
  ))

  t.is(err.message, 'boom!')
  t.deepEqual(output, input.slice(0, 1))
})
