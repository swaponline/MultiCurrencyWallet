'use strict'

/** @typedef {import('./generated-types').CodecName} CodecName */
/** @typedef {import('./generated-types').CodecNumber} CodecNumber */

const { baseTable } = require('./base-table')

/**
 * @type {Map<CodecNumber,CodecName>}
 */
const nameTable = new Map()

for (const encodingName in baseTable) {
  const code = baseTable[encodingName]
  nameTable.set(code, /** @type {CodecName} */(encodingName))
}

module.exports = Object.freeze(nameTable)
