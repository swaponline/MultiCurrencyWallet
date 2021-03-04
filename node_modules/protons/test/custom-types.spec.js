/* eslint-env mocha */

'use strict'

const { expect } = require('aegir/utils/chai')
const protobuf = require('../src')
const CustomType = protobuf(require('./test.proto')).CustomType

describe('custom types', () => {
  it('should encode and decode custom types', () => {
    var b1 = CustomType.encode({
      req: {
        num: 5,
        payload: Uint8Array.from([])
      },
      opt: {
        num: 6,
        payload: Uint8Array.from([])
      }
    })

    var o1 = CustomType.decode(b1)

    expect(o1).to.deep.equal({
      req: {
        num: 5,
        payload: Uint8Array.from([])
      },
      opt: {
        num: 6,
        payload: Uint8Array.from([])
      }
    })
  })

  it('should encode and decode custom types with optional fields', () => {
    var b1 = CustomType.encode({
      req: {
        num: 5,
        payload: Uint8Array.from([])
      }
    })

    var o1 = CustomType.decode(b1)

    expect(o1).to.deep.equal({
      req: {
        num: 5,
        payload: Uint8Array.from([])
      },
      opt: null
    })
    expect(o1.hasOpt()).to.be.false()
  })
})
