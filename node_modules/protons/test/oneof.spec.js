/* eslint-env mocha */

'use strict'

const { expect } = require('aegir/utils/chai')
const protobuf = require('../src')
const proto = protobuf(require('./test.proto'))
const Property = proto.Property
const PropertyNoOneof = proto.PropertyNoOneof

const data = {
  name: 'Foo',
  desc: 'optional description',
  int_value: 12345
}

describe('onof', () => {
  it('should encode oneof', () => {
    expect(Property.encode(data)).to.be.ok()
  })

  it('should encode and decode oneof', () => {
    const buf = Property.encode(data)
    const out = Property.decode(buf)

    expect(out).to.deep.equal(data)
  })

  it('should throw when encoding overloaded json', () => {
    expect(() => {
      Property.encode({
        name: 'Foo',
        desc: 'optional description',
        string_value: 'Bar', // ignored
        bool_value: true, // ignored
        int_value: 12345 // retained, was last entered
      })
    }).to.throw(/only one of the properties defined in oneof value can be set/)
  })

  it('should encode and decode overloaded oneof buffer', () => {
    const invalidData = {
      name: 'Foo',
      desc: 'optional description',
      string_value: 'Bar', // retained, has highest tag number
      bool_value: true, // ignored
      int_value: 12345 // ignored
    }
    const validData = {
      name: 'Foo',
      desc: 'optional description',
      string_value: 'Bar'
    }

    const buf = PropertyNoOneof.encode(invalidData)
    const out = Property.decode(buf)
    expect(validData).to.deep.equal(out)
  })
})
