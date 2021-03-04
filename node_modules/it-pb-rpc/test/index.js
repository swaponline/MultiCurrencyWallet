'use strict'

const Pair = require('it-pair')
const Wrap = require('..')
const assert = require('assert').strict
const { int32BEDecode, int32BEEncode } = require('it-length-prefixed')

/* eslint-env mocha */
/* eslint-disable require-await */

describe('it-pb-rpc', () => {
  let pair
  let w

  before(async () => {
    pair = Pair()
    w = Wrap(pair)
  })

  describe('length-prefixed', () => {
    it('lp varint', async () => {
      const data = Buffer.from('hellllllllloooo')

      w.writeLP(data)
      const res = await w.readLP()
      assert.deepEqual(data, res.slice())
    })

    it('lp fixed encode', async () => {
      const duplex = Pair()
      const wrap = Wrap(duplex, { lengthEncoder: int32BEEncode })
      const data = Buffer.from('hellllllllloooo')

      wrap.writeLP(data)
      const res = await wrap.read()
      const length = Buffer.allocUnsafe(4)
      length.writeInt32BE(data.length, 0)
      const expected = Buffer.concat([length, data])
      assert.deepEqual(res.slice(), expected)
    })

    it('lp fixed decode', async () => {
      const duplex = Pair()
      const wrap = Wrap(duplex, { lengthDecoder: int32BEDecode })
      const data = Buffer.from('hellllllllloooo')
      const length = Buffer.allocUnsafe(4)
      length.writeInt32BE(data.length, 0)
      const encoded = Buffer.concat([length, data])

      wrap.write(encoded)
      const res = await wrap.readLP()
      assert.deepEqual(res.slice(), data)
    })

    it('lp exceeds max length decode', async () => {
      const duplex = Pair()
      const wrap = Wrap(duplex, { lengthDecoder: int32BEDecode, maxDataLength: 32 })
      const data = Buffer.alloc(33, 1);
      const length = Buffer.allocUnsafe(4)
      length.writeInt32BE(data.length, 0)
      const encoded = Buffer.concat([length, data])

      wrap.write(encoded)
      try {
        await wrap.readLP()
        assert.fail("Should not be able to read too long msg data")
      } catch (e) {
        assert.ok(true);
      }
    })

    it('lp max length decode', async () => {
      const duplex = Pair()
      const wrap = Wrap(duplex, { lengthDecoder: int32BEDecode, maxDataLength: 5000 })
      const data = Buffer.allocUnsafe(4000);
      const length = Buffer.allocUnsafe(4)
      length.writeInt32BE(data.length, 0)
      const encoded = Buffer.concat([length, data])

      wrap.write(encoded)
      const res = await wrap.readLP()
      assert.deepEqual(res.slice(), data)
    })

  })

  describe('plain data', async () => {
    it('whole', async () => {
      const data = Buffer.from('ww')

      w.write(data)
      const r = await w.read(2)

      assert.deepEqual(data, r.slice())
    })

    it('split', async () => {
      const data = Buffer.from('ww')

      const r = Buffer.from('w')

      w.write(data)
      const r1 = await w.read(1)
      const r2 = await w.read(1)

      assert.deepEqual(r, r1.slice())
      assert.deepEqual(r, r2.slice())
    })
  })
})
