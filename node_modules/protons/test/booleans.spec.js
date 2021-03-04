/* eslint-env mocha */

'use strict'

const { expect } = require('aegir/utils/chai')
const protobuf = require('../src')
const proto = require('./test.proto')
const Booleans = protobuf(proto).Booleans

describe('booleans', () => {
  it('should encode and decode booleans', () => {
    const b1 = Booleans.encode({
      bool1: true,
      bool2: false
    })

    const o1 = Booleans.decode(b1)

    expect(o1).to.deep.equal({
      bool1: true,
      bool2: false
    })
  })

  it('should encode and decode optional booleans', () => {
    const b1 = Booleans.encode({
      bool1: true
    })
    const o1 = Booleans.decode(b1)

    expect(o1).to.deep.equal({
      bool1: true,
      bool2: false
    })
    expect(o1.hasBool2()).to.be.false()
  })
})
