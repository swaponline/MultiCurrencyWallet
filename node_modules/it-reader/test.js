const test = require('ava')
const Crypto = require('crypto')
const BufferList = require('bl/BufferList')
const Reader = require('.')

test('should read from source with too big first chunk', async t => {
  const input = [Crypto.randomBytes(16)]
  const reader = Reader(input)
  const { value, done } = await reader.next(8)
  t.false(done)
  t.deepEqual(input[0].slice(0, 8), value.slice())
})

test('should read from source with exact first chunk', async t => {
  const input = [Crypto.randomBytes(8)]
  const reader = Reader(input)
  let res

  res = await reader.next(8)
  t.false(res.done)
  t.deepEqual(input[0].slice(0, 8), res.value.slice())

  res = await reader.next()
  t.true(res.done)
  t.falsy(res.value)
})

test('should read from source with too small first chunk and too big second', async t => {
  const input = [Crypto.randomBytes(4), Crypto.randomBytes(8)]
  const reader = Reader(input)
  let res

  res = await reader.next(8)
  t.false(res.done)
  t.deepEqual(new BufferList(input).slice(0, 8), res.value.slice())

  res = await reader.next()
  t.false(res.done)
  t.deepEqual(new BufferList(input).slice(8), res.value.slice())

  res = await reader.next()
  t.true(res.done)
  t.falsy(res.value)
})

test('should read from source with too small first chunk and exact second', async t => {
  const input = [Crypto.randomBytes(4), Crypto.randomBytes(4)]
  const reader = Reader(input)
  let res

  res = await reader.next(8)
  t.false(res.done)
  t.deepEqual(new BufferList(input).slice(0, 8), res.value.slice())

  res = await reader.next()
  t.true(res.done)
  t.falsy(res.value)
})

test('should read bytes twice with exact first chunk', async t => {
  const input = [Crypto.randomBytes(16)]
  const reader = Reader(input)
  let res

  res = await reader.next(8)
  t.false(res.done)
  t.deepEqual(new BufferList(input).slice(0, 8), res.value.slice())

  res = await reader.next(8)
  t.false(res.done)
  t.deepEqual(new BufferList(input).slice(8, 16), res.value.slice())

  res = await reader.next()
  t.true(res.done)
  t.falsy(res.value)
})

test('should read bytes twice with too big first chunk and exact second chunk', async t => {
  const input = [Crypto.randomBytes(12), Crypto.randomBytes(4)]
  const reader = Reader(input)
  let res

  res = await reader.next(8)
  t.false(res.done)
  t.deepEqual(new BufferList(input).slice(0, 8), res.value.slice())

  res = await reader.next(8)
  t.false(res.done)
  t.deepEqual(new BufferList(input).slice(8, 16), res.value.slice())

  res = await reader.next()
  t.true(res.done)
  t.falsy(res.value)
})

test('should read bytes twice with too small first chunk and exact second chunk', async t => {
  const input = [Crypto.randomBytes(4), Crypto.randomBytes(12)]
  const reader = Reader(input)
  let res

  res = await reader.next(8)
  t.false(res.done)
  t.deepEqual(new BufferList(input).slice(0, 8), res.value.slice())

  res = await reader.next(8)
  t.false(res.done)
  t.deepEqual(new BufferList(input).slice(8, 16), res.value.slice())

  res = await reader.next()
  t.true(res.done)
  t.falsy(res.value)
})

test('should read bytes twice with too big first chunk and too big second chunk', async t => {
  const input = [Crypto.randomBytes(9), Crypto.randomBytes(12)]
  const reader = Reader(input)
  let res

  res = await reader.next(8)
  t.false(res.done)
  t.deepEqual(new BufferList(input).slice(0, 8), res.value.slice())

  res = await reader.next(8)
  t.false(res.done)
  t.deepEqual(new BufferList(input).slice(8, 16), res.value.slice())

  res = await reader.next()
  t.false(res.done)
  t.deepEqual(new BufferList(input).slice(16), res.value.slice())

  res = await reader.next()
  t.true(res.done)
  t.falsy(res.value)
})

test('should read from source and consume rest', async t => {
  const input = [Crypto.randomBytes(32), Crypto.randomBytes(3), Crypto.randomBytes(6)]
  const reader = Reader(input)
  const res = await reader.next(8)

  t.false(res.done)
  t.deepEqual(new BufferList(input).slice(0, 8), res.value.slice())

  const output = []
  for await (const chunk of reader) {
    output.push(chunk)
  }

  t.deepEqual(new BufferList(input).slice(8), new BufferList(output).slice())
})

test('should throw when source ends before read completes', async t => {
  const input = [Crypto.randomBytes(4)]
  const reader = Reader(input)
  const err = await t.throwsAsync(reader.next(8))
  t.is(err.code, 'ERR_UNDER_READ')
})

test('should expose bytes read so far for under read', async t => {
  const input = [Crypto.randomBytes(4)]
  const reader = Reader(input)
  const err = await t.throwsAsync(reader.next(8))
  t.is(err.code, 'ERR_UNDER_READ')
  t.deepEqual(err.buffer.slice(), input[0].slice(0, 4))
})
