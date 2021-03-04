/* eslint-env mocha */

'use strict'

const { expect } = require('aegir/utils/chai')
const protobuf = require('../src')
const Packed = protobuf(require('./test.proto')).Packed

describe('packed', () => {
  it('should encode packed fields', () => {
    const b1 = Packed.encode({
      packed: [
        12,
        13,
        14
      ]
    })

    const b2 = Packed.encode({
      packed: [
        12,
        13,
        14
      ],
      meeh: 42
    })

    expect(b2).to.deep.equal(b1)
  })

  it('should decode packed fields', () => {
    const b1 = Packed.encode({
      packed: [
        12,
        13,
        14
      ]
    })

    const o1 = Packed.decode(b1)

    expect(o1).to.have.deep.property('packed', [
      12,
      13,
      14
    ])

    const b2 = Packed.encode({
      packed: [
        12,
        13,
        14
      ],
      meeh: 42
    })

    const o2 = Packed.decode(b2)

    expect(o2).to.deep.equal(o1)
  })
})
