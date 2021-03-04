'use strict'

/**
 * @typedef {import('./types').Datastore} Datastore
 * @typedef {import('./types').Batch} Batch
 * @typedef {import('./types').Options} Options
 * @typedef {import('./types').Query} Query
 * @typedef {import('./types').Pair} Pair
 */

const Key = require('./key')
const MemoryDatastore = require('./memory')
const utils = require('./utils')
const Errors = require('./errors')
const Adapter = require('./adapter')

module.exports = {
  Key,
  MemoryDatastore,
  utils,
  Errors,
  Adapter
}
