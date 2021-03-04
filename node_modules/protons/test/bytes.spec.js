/* eslint-env mocha */

'use strict'

const { expect } = require('aegir/utils/chai')
const protobuf = require('../src')
const Bytes = protobuf(require('./test.proto')).Bytes

describe('bytes', () => {
  it('should encode and decode bytes', () => {
    const b1 = Bytes.encode({
      req: Uint8Array.from([0, 1, 2, 3]),
      opt: Uint8Array.from([4, 5, 6, 7])
    })

    const o1 = Bytes.decode(b1)

    expect(o1).to.deep.equal({
      req: Uint8Array.from([0, 1, 2, 3]),
      opt: Uint8Array.from([4, 5, 6, 7])
    })
  })

  it('should encode and decode optional bytes', () => {
    const b1 = Bytes.encode({
      req: Uint8Array.from([0, 1, 2, 3])
    })
    const o1 = Bytes.decode(b1)

    expect(o1).to.deep.equal({
      req: Uint8Array.from([0, 1, 2, 3]),
      opt: null
    })
    expect(o1.hasOpt()).to.be.false()
  })
})
