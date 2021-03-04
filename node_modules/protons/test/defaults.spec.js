/* eslint-env mocha */

'use strict'

const { expect } = require('aegir/utils/chai')
const protobuf = require('../src')
const Defaults = protobuf(require('./test.proto')).Defaults

describe('default', () => {
  it('should decode with defaults', () => {
    const o1 = Defaults.decode(new Uint8Array()) // everything default

    const b2 = Defaults.encode({
      num: 10,
      foos: [1]
    })

    const b3 = Defaults.encode({
      num: 10,
      foo2: 2
    })

    expect(Defaults.decode(b3)).to.deep.equal({
      num: 10,
      foo1: 2,
      foo2: 2,
      foos: []
    })

    expect(o1).to.deep.equal({
      num: 42,
      foo1: 2,
      foo2: 1,
      foos: []
    })

    expect(Defaults.decode(b2)).to.deep.equal({
      num: 10,
      foo1: 2,
      foo2: 1,
      foos: [1]
    })
  })
})
