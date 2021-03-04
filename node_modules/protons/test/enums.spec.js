/* eslint-env mocha */

'use strict'

const { expect } = require('aegir/utils/chai')
const protobuf = require('../src')
const messages = protobuf(require('./test.proto'))

describe('enums', () => {
  it('should encode and decode enums', () => {
    const e = messages.FOO

    expect(e).to.deep.equal({ A: 1, B: 2 })
  })

  it('should encode and decode hex enums', () => {
    const e = messages.FOO_HEX

    expect(e).to.deep.equal({ A: 1, B: 2 })
  })
})
