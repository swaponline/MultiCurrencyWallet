const test = require('ava')
const { Readable } = require('stream')
const pair = require('it-pair')
const toStream = require('../')
const { collect } = require('./helpers/streams')
const { randomInt, randomBytes } = require('./helpers/random')

test('should convert to duplex stream', async t => {
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
    toStream.duplex(pair())
  )

  t.deepEqual(output, input)
})
