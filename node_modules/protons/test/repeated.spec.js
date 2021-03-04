/* eslint-env mocha */

'use strict'

const { expect } = require('aegir/utils/chai')
const protobuf = require('../src')
const Repeated = protobuf(require('./test.proto')).Repeated
const uint8ArrayFromString = require('uint8arrays/from-string')

describe('repeated', () => {
  it('should encode repeated fields', () => {
    const b1 = Repeated.encode({
      list: [{
        num: 1,
        payload: uint8ArrayFromString('lol')
      }, {
        num: 2,
        payload: uint8ArrayFromString('lol1')
      }]
    })

    const b2 = Repeated.encode({
      list: [{
        num: 1,
        payload: uint8ArrayFromString('lol')
      }, {
        num: 2,
        payload: uint8ArrayFromString('lol1'),
        meeeeh: 100
      }],
      meeh: 42
    })

    expect(b2).to.deep.equal(b1)
  })

  it('should decode repeated fields', () => {
    const b1 = Repeated.encode({
      list: [{
        num: 1,
        payload: uint8ArrayFromString('lol')
      }, {
        num: 2,
        payload: uint8ArrayFromString('lol1')
      }]
    })

    const o1 = Repeated.decode(b1)

    expect(o1).to.have.deep.nested.property('list', [{
      num: 1,
      payload: uint8ArrayFromString('lol')
    }, {
      num: 2,
      payload: uint8ArrayFromString('lol1')
    }])

    const b2 = Repeated.encode({
      list: [{
        num: 1,
        payload: uint8ArrayFromString('lol')
      }, {
        num: 2,
        payload: uint8ArrayFromString('lol1'),
        meeeeh: 100
      }],
      meeh: 42
    })

    const o2 = Repeated.decode(b2)

    expect(o2).to.deep.equal(o1)
  })
})
