/* eslint-env mocha */

'use strict'

const { expect } = require('aegir/utils/chai')
const protobuf = require('../src')
const uint8ArrayFromString = require('uint8arrays/from-string')

const Nested = protobuf(require('./test.proto')).Nested

describe('nested', () => {
  it('should encode nested objects', () => {
    const b1 = Nested.encode({
      num: 1,
      payload: uint8ArrayFromString('lol'),
      meh: {
        num: 2,
        payload: uint8ArrayFromString('bar')
      }
    })

    const b2 = Nested.encode({
      num: 1,
      payload: uint8ArrayFromString('lol'),
      meeeh: 42,
      meh: {
        num: 2,
        payload: uint8ArrayFromString('bar')
      }
    })

    expect(b2).to.deep.equal(b1)
  })

  it('should decode nested objects', () => {
    const b1 = Nested.encode({
      num: 1,
      payload: uint8ArrayFromString('lol'),
      meh: {
        num: 2,
        payload: uint8ArrayFromString('bar')
      }
    })

    const o1 = Nested.decode(b1)

    expect(o1).to.have.property('num', 1)
    expect(o1).to.have.deep.property('payload', uint8ArrayFromString('lol'))
    expect(o1).to.have.deep.property('meh')

    expect(o1).to.have.deep.property('meh', {
      num: 2,
      payload: uint8ArrayFromString('bar')
    })

    const b2 = Nested.encode({
      num: 1,
      payload: uint8ArrayFromString('lol'),
      meeeh: 42,
      meh: {
        num: 2,
        payload: uint8ArrayFromString('bar')
      }
    })

    const o2 = Nested.decode(b2)

    expect(o2).to.deep.equal(o1)
  })
})
