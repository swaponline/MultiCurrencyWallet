'use strict'

// @ts-ignore
const fs = require('fs-extra')
const path = require('path')
const minimatch = require('minimatch')

/**
 * @typedef {string} Glob
 * @typedef {Object} OptionsExt
 * @property {Glob[]} [ignore] - Glob patterns to ignore
 * @property {string} [cwd=process.cwd()]
 * @property {boolean} [absolute=false] - If true produces absolute paths
 * @property {boolean} [nodir] - If true yields file paths and skip directories
 *
 * @typedef {OptionsExt & minimatch.IOptions} Options
 */

/**
 * Async iterable filename pattern matcher
 *
 * @param {string} dir
 * @param {string} pattern
 * @param {Options} [options]
 * @returns {AsyncIterable<string>}
 */
module.exports = async function * glob (dir, pattern, options = {}) {
  const absoluteDir = path.resolve(dir)
  const relativeDir = path.relative(options.cwd || process.cwd(), dir)

  const stats = await fs.stat(absoluteDir)

  if (stats.isDirectory()) {
    for await (const entry of _glob(absoluteDir, '', pattern, options)) {
      yield entry
    }

    return
  }

  if (minimatch(relativeDir, pattern)) {
    yield options.absolute ? absoluteDir : relativeDir
  }
}

/**
 * @param {string} base
 * @param {string} dir
 * @param {Glob} pattern
 * @param {Options} options
 * @returns {AsyncIterable<string>}
 */
async function * _glob (base, dir, pattern, options) {
  for await (const entry of await fs.readdir(path.join(base, dir))) {
    const relativeEntryPath = path.join(dir, entry)
    const absoluteEntryPath = path.join(base, dir, entry)
    const stats = await fs.stat(absoluteEntryPath)
    let match = minimatch(relativeEntryPath, pattern, options)

    if (options.ignore && match && options.ignore.reduce((acc, curr) => {
      return acc || minimatch(relativeEntryPath, curr, options)
    }, false)) {
      match = false
    }

    if (match && !(stats.isDirectory() && options.nodir)) {
      yield options.absolute ? absoluteEntryPath : relativeEntryPath
    }

    if (stats.isDirectory()) {
      yield * _glob(base, relativeEntryPath, pattern, options)
    }
  }
}
