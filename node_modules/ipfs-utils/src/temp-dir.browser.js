'use strict'

const { nanoid } = require('nanoid')

/**
 * Temporary folder
 *
 * @param {(uuid: string) => string} transform - Transform function to add prefixes or sufixes to the unique id
 * @returns {string} - Full real path to a temporary folder
 */
const tempdir = (transform = d => d) => {
  return transform(nanoid())
}

module.exports = tempdir
