/* eslint-env mocha */

'use strict'

const { expect } = require('aegir/utils/chai')
const protobuf = require('../src')
const Strings = protobuf(require('./test.proto')).Strings

describe('strings', () => {
  it('should encode and decode strings', () => {
    const b1 = Strings.encode({
      name: 'hello',
      desc: 'world'
    })

    const o1 = Strings.decode(b1)

    expect(o1).to.deep.equal({
      name: 'hello',
      desc: 'world'
    })
  })

  it('should encode and decode optional strings', () => {
    const b1 = Strings.encode({
      name: 'hello'
    })

    const o1 = Strings.decode(b1)

    expect(o1).to.have.property('name', 'hello')
    expect(o1.hasDesc()).to.be.false()
  })

  it('should encode and decode empty strings', () => {
    const b1 = Strings.encode({
      name: ''
    })

    const o1 = Strings.decode(b1)

    expect(o1).to.have.property('name', '')
    expect(o1.hasDesc()).to.be.false()
  })
})
