/**
 * Implementation of the multicodec specification.
 *
 * @module multicodec
 * @example
 * const multicodec = require('multicodec')
 *
 * const prefixedProtobuf = multicodec.addPrefix('protobuf', protobufBuffer)
 * // prefixedProtobuf 0x50...
 *
 */
'use strict'

/** @typedef {import('./generated-types').CodecName} CodecName */
/** @typedef {import('./generated-types').CodecNumber} CodecNumber */

const varint = require('varint')
const intTable = require('./int-table')
const codecNameToCodeVarint = require('./varint-table')
const util = require('./util')
const uint8ArrayConcat = require('uint8arrays/concat')

/**
 * Prefix a buffer with a multicodec-packed.
 *
 * @param {CodecName|Uint8Array} multicodecStrOrCode
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
function addPrefix (multicodecStrOrCode, data) {
  let prefix

  if (multicodecStrOrCode instanceof Uint8Array) {
    prefix = util.varintUint8ArrayEncode(multicodecStrOrCode)
  } else {
    if (codecNameToCodeVarint[multicodecStrOrCode]) {
      prefix = codecNameToCodeVarint[multicodecStrOrCode]
    } else {
      throw new Error('multicodec not recognized')
    }
  }
  return uint8ArrayConcat([prefix, data], prefix.length + data.length)
}

/**
 * Decapsulate the multicodec-packed prefix from the data.
 *
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
function rmPrefix (data) {
  varint.decode(data)
  return data.slice(varint.decode.bytes)
}

/**
 * Get the codec of the prefixed data.
 *
 * @param {Uint8Array} prefixedData
 * @returns {CodecName}
 */
function getCodec (prefixedData) {
  const code = varint.decode(prefixedData)
  const codecName = intTable.get(code)
  if (codecName === undefined) {
    throw new Error(`Code ${code} not found`)
  }
  return codecName
}

/**
 * Get the name of the codec.
 *
 * @param {CodecNumber} codec
 * @returns {CodecName|undefined}
 */
function getName (codec) {
  return intTable.get(codec)
}

/**
 * Get the code of the codec
 *
 * @param {CodecName} name
 * @returns {CodecNumber}
 */
function getNumber (name) {
  const code = codecNameToCodeVarint[name]
  if (code === undefined) {
    throw new Error('Codec `' + name + '` not found')
  }
  return varint.decode(code)
}

/**
 * Get the code of the prefixed data.
 *
 * @param {Uint8Array} prefixedData
 * @returns {CodecNumber}
 */
function getCode (prefixedData) {
  return varint.decode(prefixedData)
}

/**
 * Get the code as varint of a codec name.
 *
 * @param {CodecName} codecName
 * @returns {Uint8Array}
 */
function getCodeVarint (codecName) {
  const code = codecNameToCodeVarint[codecName]
  if (code === undefined) {
    throw new Error('Codec `' + codecName + '` not found')
  }
  return code
}

/**
 * Get the varint of a code.
 *
 * @param {CodecNumber} code
 * @returns {Array.<number>}
 */
function getVarint (code) {
  return varint.encode(code)
}

// Make the constants top-level constants
const constants = require('./constants')

// Human friendly names for printing, e.g. in error messages
const print = require('./print')

module.exports = {
  addPrefix,
  rmPrefix,
  getCodec,
  getName,
  getNumber,
  getCode,
  getCodeVarint,
  getVarint,
  print,
  ...constants
}
