/* eslint-env mocha */

'use strict'

const { expect } = require('aegir/utils/chai')
const protobuf = require('../src')
const proto = require('./test.proto')
const NotPacked = protobuf(proto).NotPacked
const FalsePacked = protobuf(proto).FalsePacked

describe('not packed', () => {
  it('should encode NotPacked and decode FalsePacked', () => {
    const b1 = NotPacked.encode({
      id: [9847136125],
      value: 10000
    })

    const o1 = FalsePacked.decode(b1)

    expect(o1).to.have.deep.property('id', [9847136125])
  })

  it('should encode FalsePacked and decode NotPacked', () => {
    const b1 = FalsePacked.encode({
      id: [9847136125],
      value: 10000
    })

    const o1 = NotPacked.decode(b1)

    expect(o1).to.have.deep.property('id', [9847136125])
  })
})
