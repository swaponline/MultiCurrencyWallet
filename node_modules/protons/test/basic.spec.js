/* eslint-env mocha */

'use strict'

const { expect } = require('aegir/utils/chai')
const protobufNpm = require('protocol-buffers')
const protobuf = require('../src')
const proto = require('./test.proto')
const Basic = protobuf(proto).Basic
const BasicNpm = protobufNpm(proto).Basic
const uint8ArrayFromString = require('uint8arrays/from-string')
const uint8ArrayToString = require('uint8arrays/to-string')

describe('basic', () => {
  it('should encode basic object', () => {
    const first = {
      num: 1,
      payload: uint8ArrayFromString('lol')
    }

    const b1 = Basic.encode(first)

    const bn1 = BasicNpm.encode({
      ...first,
      payload: 'lol' // old version does not support Uint8Arrays
    })

    expect(uint8ArrayToString(b1, 'base16')).to.equal(uint8ArrayToString(bn1, 'base16'))

    const b2 = Basic.encode({
      num: 1,
      payload: uint8ArrayFromString('lol'),
      meeeh: 42
    })

    const b3 = Basic.encode({
      num: 1,
      payload: uint8ArrayFromString('lol'),
      meeeh: 42
    })

    expect(b2).to.deep.equal(b1)
    expect(b3).to.deep.equal(b1)
  })

  it('should encode and decode basic object', () => {
    const b1 = Basic.encode({
      num: 1,
      payload: uint8ArrayFromString('lol')
    })

    const o1 = Basic.decode(b1)

    expect(o1).to.have.property('num', 1)
    expect(o1).to.have.deep.property('payload', uint8ArrayFromString('lol'))

    const b2 = Basic.encode({
      num: 1,
      payload: uint8ArrayFromString('lol'),
      meeeh: 42
    })

    const o2 = Basic.decode(b2)

    expect(o2).to.deep.equal(o1)
  })

  it('should add basic accessors', () => {
    const b1 = Basic.encode({
      num: 1,
      payload: uint8ArrayFromString('lol')
    })

    const o1 = Basic.decode(b1)

    expect(o1).to.have.property('hasNum').that.is.a('function')
    expect(o1.hasNum()).to.be.true()

    expect(o1).to.have.property('setNum').that.is.a('function')
    o1.setNum(5)

    expect(o1).to.have.property('getNum').that.is.a('function')
    expect(o1.getNum(5)).to.equal(5)

    expect(o1).to.have.property('clearNum').that.is.a('function')
    o1.clearNum()

    expect(o1.getNum(5)).to.be.undefined()

    const methods = Object.keys(o1)

    expect(methods).to.not.include('getNum')
    expect(methods).to.not.include('setNum')
    expect(methods).to.not.include('hasNum')
    expect(methods).to.not.include('clearNum')
  })

  it('should encode and decode floats in a basic object', () => {
    const b1 = Basic.encode({
      num: 1.1,
      payload: uint8ArrayFromString('lol')
    })

    const o1 = Basic.decode(b1)

    expect(o1).to.have.property('num', 1.1)
    expect(o1).to.have.deep.property('payload', uint8ArrayFromString('lol'))
  })
})
