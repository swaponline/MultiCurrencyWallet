/* eslint max-depth: 1 */
'use strict'

const varint = require('varint')
const defined = require('./utils').defined

function toSentenceCase (string) {
  return `${string.substring(0, 1).toUpperCase()}${string.substring(1)}`
}

function addPropertyAccessors (obj, name, value, defaultValue) {
  if (Object.prototype.hasOwnProperty.call(obj, name)) {
    // have already added this property
    return
  }

  const sentenceCaseName = toSentenceCase(name)

  Object.defineProperties(obj, {
    [name]: {
      enumerable: true,
      configurable: true,
      set: (val) => {
        value = val
      },
      get: () => {
        if (value === undefined) {
          return defaultValue
        }

        return value
      }
    },
    [`has${sentenceCaseName}`]: {
      configurable: true,
      value: () => {
        return value !== undefined
      }
    },
    [`set${sentenceCaseName}`]: {
      configurable: true,
      value: (val) => {
        value = val
      }
    },
    [`get${sentenceCaseName}`]: {
      configurable: true,
      value: () => {
        return value
      }
    },
    [`clear${sentenceCaseName}`]: {
      configurable: true,
      value: () => {
        value = undefined
        obj[name] = undefined
      }
    }
  })
}

function compileDecode (m, resolve, enc) {
  const requiredFields = []
  const fields = {}
  const oneofFields = []
  const vals = []

  for (var i = 0; i < enc.length; i++) {
    const field = m.fields[i]

    fields[field.tag] = i

    const def = field.options && field.options.default
    const resolved = resolve(field.type, m.id, false)
    vals[i] = [def, resolved && resolved.values]

    m.fields[i].packed = field.repeated && field.options && field.options.packed && field.options.packed !== 'false'

    if (field.required) {
      requiredFields.push(field.name)
    }

    if (field.oneof) {
      oneofFields.push(field.name)
    }
  }

  function decodeField (e, field, obj, buf, dataView, offset, i) {
    const name = field.name

    if (field.oneof) {
      // clear already defined oneof fields
      const props = Object.keys(obj)
      for (var j = 0; j < props.length; j++) {
        if (oneofFields.indexOf(props[j]) > -1) {
          const sentenceCase = toSentenceCase(props[j])
          delete obj[`has${sentenceCase}`]
          delete obj[`get${sentenceCase}`]
          delete obj[`set${sentenceCase}`]
          delete obj[`clear${sentenceCase}`]
          delete obj[props[j]]
        }
      }
    }

    let value

    if (e.message) {
      const len = varint.decode(buf, offset)
      offset += varint.decode.bytes

      const decoded = e.decode(buf, dataView, offset, offset + len)

      if (field.map) {
        value = obj[name] || {}
        value[decoded.key] = decoded.value
      } else if (field.repeated) {
        value = obj[name] || []
        value.push(decoded)
      } else {
        value = decoded
      }
    } else {
      if (field.repeated) {
        value = obj[name] || []
        value.push(e.decode(buf, dataView, offset))
      } else {
        value = e.decode(buf, dataView, offset)
      }
    }

    addPropertyAccessors(obj, name, value)

    offset += e.decode.bytes

    return offset
  }

  return function decode (buf, view, offset, end) {
    if (offset == null) {
      offset = 0
    }

    if (end == null) {
      end = buf.length
    }

    if (!(end <= buf.length && offset <= buf.length)) {
      throw new Error('Decoded message is not valid')
    }

    if (!view) {
      view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
    }

    var oldOffset = offset
    var obj = {}
    var field

    while (true) {
      if (end <= offset) {
        // finished

        // check required methods
        var name = ''
        var j = 0
        for (j = 0; j < requiredFields.length; j++) {
          name = requiredFields[j]
          if (!defined(obj[name])) {
            throw new Error('Decoded message is not valid, missing required field: ' + name)
          }
        }

        // fill out missing defaults
        var val
        var def
        for (j = 0; j < enc.length; j++) {
          field = m.fields[j]
          def = vals[j][0]
          val = vals[j][1]
          name = field.name
          let defaultVal

          if (Object.prototype.hasOwnProperty.call(obj, name)) {
            continue
          }

          var done = false

          if (field.oneof) {
            var props = Object.keys(obj)

            for (var k = 0; k < props.length; k++) {
              if (oneofFields.indexOf(props[k]) > -1) {
                done = true
                break
              }
            }
          }

          if (done) {
            continue
          }

          if (val) { // is enum
            if (field.repeated) {
              def = []
            } else {
              def = (def && val[def]) ? val[def].value : val[Object.keys(val)[0]].value
              def = parseInt(def || 0, 10)
            }
          } else {
            defaultVal = defaultValue(field)
            def = coerceValue(field, def)
          }

          addPropertyAccessors(obj, name, def, defaultVal)
        }

        decode.bytes = offset - oldOffset
        return obj
      }

      var prefix = varint.decode(buf, offset)
      offset += varint.decode.bytes
      var tag = prefix >> 3

      var i = fields[tag]

      if (i == null) {
        offset = skip(prefix & 7, buf, view, offset)
        continue
      }

      var e = enc[i]
      field = m.fields[i]

      if (field.packed) {
        var packedEnd = varint.decode(buf, offset)
        offset += varint.decode.bytes
        packedEnd += offset

        while (offset < packedEnd) {
          offset = decodeField(e, field, obj, buf, view, offset, i)
        }
      } else {
        offset = decodeField(e, field, obj, buf, view, offset, i)
      }
    }
  }
}

var skip = function (type, buffer, view, offset) {
  switch (type) {
    case 0:
      varint.decode(buffer, offset)
      return offset + varint.decode.bytes

    case 1:
      return offset + 8

    case 2:
      var len = varint.decode(buffer, offset)
      return offset + varint.decode.bytes + len

    case 3:
    case 4:
      throw new Error('Groups are not supported')

    case 5:
      return offset + 4
    default:
      throw new Error('Unknown wire type: ' + type)
  }
}

var defaultValue = function (f) {
  if (f.map) return {}
  if (f.repeated) return []

  switch (f.type) {
    case 'string':
      return ''
    case 'bool':
      return false
    case 'float':
    case 'double':
    case 'sfixed32':
    case 'fixed32':
    case 'varint':
    case 'enum':
    case 'uint64':
    case 'uint32':
    case 'int64':
    case 'int32':
    case 'sint64':
    case 'sint32':
      return 0
    default:
      return null
  }
}

var coerceValue = function (f, def) {
  if (def === undefined) {
    return def
  }

  switch (f.type) {
    case 'bool':
      return def === 'true'
    case 'float':
    case 'double':
    case 'sfixed32':
    case 'fixed32':
    case 'varint':
    case 'enum':
    case 'uint64':
    case 'uint32':
    case 'int64':
    case 'int32':
    case 'sint64':
    case 'sint32':
      return parseInt(def, 10)
    default:
      return def
  }
}

module.exports = compileDecode
