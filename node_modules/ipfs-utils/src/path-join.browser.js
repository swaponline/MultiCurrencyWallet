'use strict'

/**
 * @param {string[]} args
 */
function join (...args) {
  if (args.length === 0) {
    return '.'
  }

  return args.join('/')
}

module.exports = join
