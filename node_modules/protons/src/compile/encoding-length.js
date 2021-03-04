'use strict'

var defined = require('./utils').defined
var varint = require('varint')

function compileEncodingLength (m, enc, oneofs) {
  const oneofsKeys = Object.keys(oneofs)
  const encLength = enc.length

  const hls = new Array(encLength)

  for (let i = 0; i < m.fields.length; i++) {
    hls[i] = varint.encodingLength(m.fields[i].tag << 3 | enc[i].type)

    const field = m.fields[i]
    m.fields[i].packed = field.repeated && field.options && field.options.packed && field.options.packed !== 'false'
  }

  return function encodingLength (obj) {
    let length = 0
    let i = 0
    let j = 0

    for (i = 0; i < oneofsKeys.length; i++) {
      const name = oneofsKeys[i]
      const props = oneofs[name]

      let match = false
      for (j = 0; j < props.length; j++) {
        if (defined(obj[props[j]])) {
          if (match) {
            throw new Error('only one of the properties defined in oneof ' + name + ' can be set')
          }
          match = true
        }
      }
    }

    for (i = 0; i < encLength; i++) {
      const e = enc[i]
      const field = m.fields[i]
      let val = obj[field.name]
      const hl = hls[i]
      let len

      if (!defined(val)) {
        if (field.required) {
          throw new Error(field.name + ' is required')
        }

        continue
      }

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

      if (field.packed) {
        let packedLen = 0
        for (j = 0; j < val.length; j++) {
          if (!defined(val[j])) {
            continue
          }
          len = e.encodingLength(val[j])
          packedLen += len

          if (e.message) {
            packedLen += varint.encodingLength(len)
          }
        }

        if (packedLen) {
          length += hl + packedLen + varint.encodingLength(packedLen)
        }
      } else if (field.repeated) {
        for (j = 0; j < val.length; j++) {
          if (!defined(val[j])) {
            continue
          }

          len = e.encodingLength(val[j])
          length += hl + len + (e.message ? varint.encodingLength(len) : 0)
        }
      } else {
        len = e.encodingLength(val)
        length += hl + len + (e.message ? varint.encodingLength(len) : 0)
      }
    }

    return length
  }
}

module.exports = compileEncodingLength
