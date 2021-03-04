'use strict'

/* eslint-env mocha */
const { Buffer } = require('buffer')
const assert = require('assert').strict
const { collect } = require('streaming-iterables')
const pipe = require('it-pipe')
const toBuffer = require('.')
const BufferList = require('bl/BufferList')

const t = (name, input, output) => {
  it(name, async () => {
    const res = await pipe(
      function * () {
        yield input
      },
      toBuffer,
      collect
    )

    assert.deepEqual(res, [output], 'invalid data returned')
  })
}

const t2 = (name, input, output) => {
  it(name, async () => {
    const res = await pipe(
      function * () {
        yield input
      },
      toBuffer.toList,
      collect
    )

    assert.deepEqual(res, [output], 'invalid data returned')
  })
}

describe('it-buffer', () => {
  t(
    'string',
    'hello',
    Buffer.from('hello')
  )

  t(
    'buffer',
    Buffer.from('hi'),
    Buffer.from('hi')
  )

  t(
    'buffer-list',
    new BufferList().append(Buffer.from('hello')).append(Buffer.from('world')),
    Buffer.from('helloworld')
  )

  t2(
    'string',
    'hello',
    new BufferList().append(Buffer.from('hello'))
  )

  t2(
    'buffer',
    Buffer.from('hi'),
    new BufferList().append(Buffer.from('hi'))
  )

  t2(
    'buffer-list',
    new BufferList().append(Buffer.from('hello')).append(Buffer.from('world')),
    new BufferList().append(Buffer.from('hello')).append(Buffer.from('world'))
  )
})
