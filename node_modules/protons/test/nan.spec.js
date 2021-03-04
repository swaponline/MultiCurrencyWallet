/* eslint-env mocha */

'use strict'

const { expect } = require('aegir/utils/chai')
const protobuf = require('../src')

const protoStr = 'message MyMessage {\n' +
  '  optional uint32 my_number = 1;\n' +
  '  required string my_other = 2;\n' +
  '}'

const messages = protobuf(protoStr)

describe('NaN', () => {
  it('should consider NaN as not defined', () => {
    const testString = 'hello!'
    const properResult = Uint8Array.from([0x12, 0x06, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x21])
    const encoded = messages.MyMessage.encode({
      my_number: NaN,
      my_other: testString
    })
    const decoded = messages.MyMessage.decode(encoded)

    expect(decoded).to.have.property('my_other', testString)
    expect(encoded).to.deep.equal(properResult)
  })
})
