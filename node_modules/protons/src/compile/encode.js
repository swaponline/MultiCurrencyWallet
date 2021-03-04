'use strict'

var defined = require('./utils').defined
var varint = require('varint')

function compileEncode (m, resolve, enc, oneofs, encodingLength) {
  const oneofsKeys = Object.keys(oneofs)
  const encLength = enc.length
  const ints = {}
  for (let i = 0; i < encLength; i++) {
    ints[i] = {
      p: varint.encode(m.fields[i].tag << 3 | 2),
      h: varint.encode(m.fields[i].tag << 3 | enc[i].type)
    }

    const field = m.fields[i]
    m.fields[i].packed = field.repeated && field.options && field.options.packed && field.options.packed !== 'false'
  }

  function encodeField (buf, view, offset, h, e, packed, innerVal) {
    let j = 0
    if (!packed) {
      for (j = 0; j < h.length; j++) {
        buf[offset++] = h[j]
      }
    }

    if (e.message) {
      varint.encode(e.encodingLength(innerVal), buf, offset)
      offset += varint.encode.bytes
    }

    e.encode(innerVal, buf, view, offset)

    return offset + e.encode.bytes
  }

  return function encode (obj, buf, view, offset = 0) {
    if (buf == null) {
      buf = new Uint8Array(encodingLength(obj))
    }

    if (view == null) {
      view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
    }

    const oldOffset = offset
    const objKeys = Object.keys(obj)
    let i = 0

    // oneof checks

    let match = false
    for (i = 0; i < oneofsKeys.length; i++) {
      const name = oneofsKeys[i]
      const prop = oneofs[i]
      if (objKeys.indexOf(prop) > -1) {
        if (match) {
          throw new Error('only one of the properties defined in oneof ' + name + ' can be set')
        }

        match = true
      }
    }

    for (i = 0; i < encLength; i++) {
      const e = enc[i]
      const field = m.fields[i] // was f
      let val = obj[field.name]
      let j = 0

      if (!defined(val)) {
        if (field.required) {
          throw new Error(field.name + ' is required')
        }
        continue
      }
      const p = ints[i].p
      const h = ints[i].h

      const packed = field.packed

      if (field.map) {
        const tmp = Object.keys(val)
        for (j = 0; j < tmp.length; j++) {
          tmp[j] = {
            key: tmp[j],
            value: val[tmp[j]]
          }
        }
        val = tmp
      }

      if (packed) {
        let packedLen = 0
        for (j = 0; j < val.length; j++) {
          if (!Object.prototype.hasOwnProperty.call(val, j)) {
            continue
          }

          packedLen += e.encodingLength(val[j])
        }

        if (packedLen) {
          for (j = 0; j < h.length; j++) {
            buf[offset++] = p[j]
          }
          varint.encode(packedLen, buf, offset)
          offset += varint.encode.bytes
        }
      }

      if (field.repeated) {
        let innerVal
        for (j = 0; j < val.length; j++) {
          innerVal = val[j]
          if (!defined(innerVal)) {
            continue
          }

          offset = encodeField(buf, view, offset, h, e, packed, innerVal)
        }
      } else {
        offset = encodeField(buf, view, offset, h, e, packed, val)
      }
    }

    encode.bytes = offset - oldOffset
    return buf
  }
}

module.exports = compileEncode
