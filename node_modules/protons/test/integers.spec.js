/* eslint-env mocha */

'use strict'

const { expect } = require('aegir/utils/chai')
const protobuf = require('../src')
const Integers = protobuf(require('./test.proto')).Integers

describe('integers', () => {
  it('should encode and decode integers', () => {
    const b1 = Integers.encode({
      sint32: 1,
      sint64: 2,
      int32: 3,
      uint32: 4,
      int64: 5,
      fixed32: 6
    })

    const o1 = Integers.decode(b1)

    expect(o1).to.deep.equal({
      sint32: 1,
      sint64: 2,
      int32: 3,
      uint32: 4,
      int64: 5,
      fixed32: 6
    })
  })

  it('should encode and decode negative integers', () => {
    const b1 = Integers.encode({
      sint32: -1,
      sint64: -2,
      int32: -3,
      uint32: 0,
      int64: -1 * Math.pow(2, 52) - 5,
      fixed32: 0
    })

    const o1 = Integers.decode(b1)

    expect(o1).to.deep.equal({
      sint32: -1,
      sint64: -2,
      int32: -3,
      uint32: 0,
      int64: -1 * Math.pow(2, 52) - 5,
      fixed32: 0
    })
  })

  it('should encode and decode optional integers', () => {
    const b1 = Integers.encode({
      sint32: null
    })
    const b2 = Integers.encode({
      sint32: 0
    })

    // sint32 is optional, verify that setting it to null does not
    // cause a value to be written into the encoded buffer
    expect(b1.length).to.be.lessThan(b2.length)

    const o1 = Integers.decode(b1)
    expect(o1.hasSint32()).to.be.false()

    const o2 = Integers.decode(b2)
    expect(o2.sint32).to.equal(0)
  })
})
