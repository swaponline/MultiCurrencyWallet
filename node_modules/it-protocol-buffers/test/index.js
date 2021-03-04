'use strict'

/* eslint-env mocha */

const assert = require('assert').strict

const pStream = require('..')
const pStreamIT = require('../it')

const pipe = require('it-pipe')

const pb = require('protons')
const testmsg = pb('message Test { string content = 1 ; }').Test
const testdata = ['hello', 'world', 'randomnonsense⅜£¤⅜£ŁŦŁŊẞ€Ŋ', 'hello world!!!1'].map(content => {
  return {
    content
  }
})

const { collect } = require('streaming-iterables')
const toBuffer = require('it-buffer')

const src = function * (array) {
  for (let i = 0; i < array.length; i++) {
    yield array[i]
  }
}

describe('it-protocol-buffers', () => {
  describe('lp', () => {
    it('should decode and encode', async () => {
      const res = await pipe(
        src(testdata),
        pStream.encode(testmsg),
        pStream.decode(testmsg),
        collect
      )

      assert.deepEqual(res, testdata, 'invalid data returned')
    })
  })

  const outdata = [testmsg.encode(testdata[3])]

  describe('single', () => {
    it('should encode a single element', async () => {
      const res = await pipe(
        src([testdata[3]]),
        pStreamIT.encode(testmsg),
        toBuffer,
        collect
      )

      assert.deepEqual(res, outdata, 'invalid data returned')
    })

    it('should decode a single element', async () => {
      const res = await pipe(
        src(outdata),
        pStreamIT.decode(testmsg),
        collect
      )

      assert.deepEqual(res, [testdata[3]], 'invalid data returned')
    })
  })
})
