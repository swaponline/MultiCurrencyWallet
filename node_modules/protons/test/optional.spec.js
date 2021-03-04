/* eslint-env mocha */

'use strict'

const { expect } = require('aegir/utils/chai')
const protobuf = require('../src')
const proto = require('./test.proto')
const Optional = protobuf(proto).Optional

describe('optional', () => {
  it('should encode and decode zero value for optional value', () => {
    const o1 = {}
    const b1 = Optional.encode(o1)
    const o2 = Optional.decode(b1)

    expect(o1).to.not.have.property('value')
    expect(o2).to.have.property('value', 0)
  })

  it('should create accessors for optional values', () => {
    const o1 = Optional.decode(Optional.encode({}))

    expect(o1).to.have.property('hasValue').that.is.a('function')
    expect(o1.hasValue()).to.be.false()

    expect(o1).to.have.property('setValue').that.is.a('function')
    o1.setValue(5)
    expect(o1.hasValue()).to.be.true()

    expect(o1).to.have.property('getValue').that.is.a('function')
    expect(o1.getValue()).to.equal(5)

    expect(o1).to.have.property('clearValue').that.is.a('function')
    o1.clearValue()

    expect(o1.hasValue()).to.be.false()
    expect(o1.getValue()).to.be.undefined()
  })

  it('should have non-enumerable accessors for optional values', () => {
    const o1 = Optional.decode(Optional.encode({}))
    const methods = Object.keys(o1)

    expect(methods).to.not.include('getValue')
    expect(methods).to.not.include('setValue')
    expect(methods).to.not.include('hasValue')
    expect(methods).to.not.include('clearValue')
  })

  it('should return zero values from optional accessors when no value has been set', () => {
    const o1 = Optional.decode(Optional.encode({}))

    expect(o1.hasValue()).to.be.false()
    o1.setValue(0)
    expect(o1.hasValue()).to.be.true()

    expect(o1.getValue).to.be.a('function')
    expect(o1.getValue()).to.equal(0)

    const o2 = Optional.decode(Optional.encode(o1))

    expect(o2.hasValue()).to.be.ok()
    expect(o2.getValue()).to.equal(0)
  })
})
