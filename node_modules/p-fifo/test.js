const test = require('ava')
const Fifo = require('.')

const randomInt = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

test('should await for shift', async t => {
  const fifo = new Fifo()
  const input = Math.random()

  setTimeout(() => fifo.push(input), 10)
  const output = await fifo.shift()

  t.is(output, input)
})

test('should await for push', async t => {
  const fifo = new Fifo()
  const input = Math.random()

  setTimeout(async () => {
    const output = await fifo.shift()
    t.is(output, input)
  }, 10)

  await fifo.push(input)
})

test('should consume values in parallel from a full buffer', async t => {
  const fifo = new Fifo()
  const input = Array.from(Array(randomInt(5, 100)), () => Math.random())

  input.forEach(v => fifo.push(v))

  const output = await Promise.all(input.map(() => fifo.shift()))

  t.deepEqual(output, input)
})

test('should await all pushed values', async t => {
  const fifo = new Fifo()
  const input = Array.from(Array(randomInt(5, 100)), () => Math.random())

  const pushPromises = input.map(v => fifo.push(v))

  setTimeout(() => {
    input.slice(0, -1).forEach(() => fifo.shift())
  }, 10)

  setTimeout(() => {
    t.false(fifo.isEmpty())
    input.slice(-1).forEach(() => fifo.shift())
  }, 50)

  await Promise.all(pushPromises)
})
