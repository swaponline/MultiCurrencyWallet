'use strict'

/** @typedef {import('./generated-types').CodecName} CodecName */
/** @typedef {import('./generated-types').NumberNameMap} NumberNameMap */

const { baseTable } = require('./base-table')

const tableByCode = /** @type {NumberNameMap} */({})

for (const [name, code] of Object.entries(baseTable)) {
  if (tableByCode[code] === undefined) {
    tableByCode[code] = /** @type {CodecName} **/(name)
  }
}

module.exports = /** @type {NumberNameMap} */(Object.freeze(tableByCode))
