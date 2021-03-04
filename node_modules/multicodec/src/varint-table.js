'use strict'

/** @typedef {import('./generated-types').NameUint8ArrayMap} NameUint8ArrayMap */

const { baseTable } = require('./base-table')
const varintEncode = require('./util').varintEncode

const varintTable = /** @type {NameUint8ArrayMap} */ ({})

for (const encodingName in baseTable) {
  const code = baseTable[encodingName]
  varintTable[encodingName] = varintEncode(code)
}

module.exports = Object.freeze(varintTable)
