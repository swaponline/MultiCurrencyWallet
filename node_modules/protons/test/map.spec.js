/* eslint-env mocha */

'use strict'

const { expect } = require('aegir/utils/chai')
const protobuf = require('../src')
const Map = protobuf(require('./test.proto')).Map

describe('maps', () => {
  it('should encode and decode maps', () => {
    const b1 = Map.encode({
      foo: {
        hello: 'world'
      }
    })

    const o1 = Map.decode(b1)

    expect(o1).to.have.deep.property('foo', { hello: 'world' })
  })

  it('should encode and decode maps with multiple fields', () => {
    const doc = {
      foo: {
        hello: 'world',
        hi: 'verden'
      }
    }

    const b2 = Map.encode(doc)
    const o2 = Map.decode(b2)

    expect(o2).to.deep.equal(doc)
  })
})
