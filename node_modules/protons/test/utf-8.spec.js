/* eslint-env mocha */

'use strict'

const { expect } = require('aegir/utils/chai')
const protobuf = require('../src')
const UTF8 = protobuf(require('./test.proto')).UTF8

describe('utf-8', () => {
  it('should encode multi-byte strings', () => {
    const ex = {
      foo: 'ビッグデータ「人間の解釈が必要」「量の問題ではない」論と、もう一つのビッグデータ「人間の解釈が必要」「量の問題ではない」論と、もう一つの',
      bar: 42
    }

    const b1 = UTF8.encode(ex)
    const b2 = UTF8.decode(b1)

    expect(b2).to.deep.equal(ex)
  })
})
