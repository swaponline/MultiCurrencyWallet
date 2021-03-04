'use strict'

const fs = require('fs-extra')
const glob = require('it-glob')
const Path = require('path')
const errCode = require('err-code')

/**
 * Create an async iterator that yields paths that match requested file paths.
 *
 * @param {Iterable<string> | AsyncIterable<string> | string} paths - File system path(s) to glob from
 * @param {Object} [options] - Optional options
 * @param {boolean} [options.recursive] - Recursively glob all paths in directories
 * @param {boolean} [options.hidden] - Include .dot files in matched paths
 * @param {Array<string>} [options.ignore] - Glob paths to ignore
 * @param {boolean} [options.followSymlinks] - follow symlinks
 * @param {boolean} [options.preserveMode] - preserve mode
 * @param {boolean} [options.preserveMtime] - preserve mtime
 * @param {number} [options.mode] - mode to use - if preserveMode is true this will be ignored
 * @param {Date} [options.mtime] - mtime to use - if preserveMtime is true this will be ignored
 * @yields {Object} File objects in the form `{ path: String, content: AsyncIterator<Buffer> }`
 */
module.exports = async function * globSource (paths, options) {
  options = options || {}

  if (typeof paths === 'string') {
    paths = [paths]
  }

  const globSourceOptions = {
    recursive: options.recursive,
    glob: {
      dot: Boolean(options.hidden),
      ignore: Array.isArray(options.ignore) ? options.ignore : [],
      follow: options.followSymlinks != null ? options.followSymlinks : true
    }
  }

  // Check the input paths comply with options.recursive and convert to glob sources
  for await (const path of paths) {
    if (typeof path !== 'string') {
      throw errCode(
        new Error('Path must be a string'),
        'ERR_INVALID_PATH',
        { path }
      )
    }

    const absolutePath = Path.resolve(process.cwd(), path)
    const stat = await fs.stat(absolutePath)
    const prefix = Path.dirname(absolutePath)

    let mode = options.mode

    if (options.preserveMode) {
      // @ts-ignore
      mode = stat.mode
    }

    let mtime = options.mtime

    if (options.preserveMtime) {
      // @ts-ignore
      mtime = stat.mtime
    }

    if (stat.isDirectory()) {
      yield {
        path: `/${Path.basename(path)}`,
        mode,
        mtime
      }
    }

    yield * toGlobSource({
      path,
      type: stat.isDirectory() ? 'dir' : 'file',
      prefix,
      mode,
      mtime,
      preserveMode: options.preserveMode,
      preserveMtime: options.preserveMtime
    }, globSourceOptions)
  }
}

// @ts-ignore
async function * toGlobSource ({ path, type, prefix, mode, mtime, preserveMode, preserveMtime }, options) {
  options = options || {}

  const baseName = Path.basename(path)

  if (type === 'file') {
    yield {
      path: `/${baseName.replace(prefix, '')}`,
      content: fs.createReadStream(Path.isAbsolute(path) ? path : Path.join(process.cwd(), path)),
      mode,
      mtime
    }

    return
  }

  if (type === 'dir' && !options.recursive) {
    throw errCode(
      new Error(`'${path}' is a directory and recursive option not set`),
      'ERR_DIR_NON_RECURSIVE',
      { path }
    )
  }

  const globOptions = Object.assign({}, options.glob, {
    cwd: path,
    nodir: false,
    realpath: false,
    absolute: true
  })

  for await (const p of glob(path, '**/*', globOptions)) {
    const stat = await fs.stat(p)

    if (preserveMode || preserveMtime) {
      if (preserveMode) {
        mode = stat.mode
      }

      if (preserveMtime) {
        mtime = stat.mtime
      }
    }

    yield {
      path: toPosix(p.replace(prefix, '')),
      content: stat.isFile() ? fs.createReadStream(p) : undefined,
      mode,
      mtime
    }
  }
}

/**
 * @param {string} path
 */
const toPosix = path => path.replace(/\\/g, '/')
