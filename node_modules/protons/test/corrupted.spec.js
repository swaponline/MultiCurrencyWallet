/* eslint-env mocha */

'use strict'

const { expect } = require('aegir/utils/chai')
const uint8ArrayFromString = require('uint8arrays/from-string')
const protobuf = require('../src')

const protoStr = 'enum AbcType {\n' +
  '  IGNORE                 =  0;\n' +
  '  ACK_CONFIRMATION_TOKEN =  1;\n' +
  '}\n' +
  'message AbcAcknowledgeConfirmationToken { // 0x01\n' +
  '  optional uint64 confirmation_token = 1;\n' +
  '  extensions 1000 to max;\n' +
  '}\n' +
  'message ABC {\n' +
  '  required AbcType type = 9;\n' +
  '  required uint32 api_version = 8;\n' +
  '  optional AbcAcknowledgeConfirmationToken ack_confirmation_token = 1;\n' +
  '  extensions 1000 to max;\n' +
  '}\n' +
  'message Open {\n' +
  '  required bytes feed = 1;\n' +
  '  required bytes nonce = 2;\n' +
  '}'

const messages = protobuf(protoStr)

describe('corrupted', () => {
  it('should fail to decode an invalid message', () => {
    expect(() => {
      messages.ABC.decode(Uint8Array.from([8, 182, 168, 235, 144, 178, 41]))
    }).to.throw(/not valid/)
  })

  it('should fail to decode non-byte arrays', () => {
    expect(() => {
      messages.ABC.decode({})
    }).to.throw(/not valid/)
  })

  it('should fail to decode a base16 message', () => {
    const buf = uint8ArrayFromString('cec1', 'base16')

    expect(() => {
      messages.Open.decode(buf)
    }).to.throw(/Could not decode varint/)
  })
})
