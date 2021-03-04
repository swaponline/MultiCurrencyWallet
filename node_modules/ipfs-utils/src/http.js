/* eslint-disable no-undef */
'use strict'

const { fetch, Request, Headers } = require('./http/fetch')
const { TimeoutError, HTTPError } = require('./http/error')
const merge = require('merge-options').bind({ ignoreUndefined: true })
const { URL, URLSearchParams } = require('iso-url')
const TextDecoder = require('./text-decoder')
const { AbortController } = require('native-abort-controller')
const anySignal = require('any-signal')

/**
 * @typedef {import('electron-fetch').Response} Response
 * @typedef {import('stream').Readable} NodeReadableStream
 * @typedef {import('stream').Duplex} NodeDuplexStream
 * @typedef {import('./types').HTTPOptions} HTTPOptions
 */

/**
 * @template TResponse
 * @param {Promise<TResponse>} promise
 * @param {number | undefined} ms
 * @param {AbortController} abortController
 * @returns {Promise<TResponse>}
 */
const timeout = (promise, ms, abortController) => {
  if (ms === undefined) {
    return promise
  }

  const start = Date.now()

  const timedOut = () => {
    const time = Date.now() - start

    return time >= ms
  }

  return new Promise((resolve, reject) => {
    const timeoutID = setTimeout(() => {
      if (timedOut()) {
        reject(new TimeoutError())
        abortController.abort()
      }
    }, ms)

    /**
     * @param {(value: any) => void } next
     */
    const after = (next) => {
      /**
       * @param {any} res
       */
      const fn = (res) => {
        clearTimeout(timeoutID)

        if (timedOut()) {
          reject(new TimeoutError())
          return
        }

        next(res)
      }
      return fn
    }

    promise
      .then(after(resolve), after(reject))
  })
}

const defaults = {
  throwHttpErrors: true,
  credentials: 'same-origin'
}

class HTTP {
  /**
   *
   * @param {HTTPOptions} options
   */
  constructor (options = {}) {
    /** @type {HTTPOptions} */
    this.opts = merge(defaults, options)
  }

  /**
   * Fetch
   *
   * @param {string | Request} resource
   * @param {HTTPOptions} options
   * @returns {Promise<Response>}
   */
  async fetch (resource, options = {}) {
    /** @type {HTTPOptions} */
    const opts = merge(this.opts, options)
    const headers = new Headers(opts.headers)

    // validate resource type
    if (typeof resource !== 'string' && !(resource instanceof URL || resource instanceof Request)) {
      throw new TypeError('`resource` must be a string, URL, or Request')
    }

    const url = new URL(resource.toString(), opts.base)

    const {
      searchParams,
      transformSearchParams,
      json
    } = opts

    if (searchParams) {
      if (typeof transformSearchParams === 'function') {
        // @ts-ignore
        url.search = transformSearchParams(new URLSearchParams(opts.searchParams))
      } else {
        // @ts-ignore
        url.search = new URLSearchParams(opts.searchParams)
      }
    }

    if (json) {
      opts.body = JSON.stringify(opts.json)
      headers.set('content-type', 'application/json')
    }

    const abortController = new AbortController()
    // @ts-ignore
    const signal = anySignal([abortController.signal, opts.signal])

    const response = await timeout(
      fetch(
        url.toString(),
        {
          ...opts,
          signal,
          timeout: undefined,
          headers
        }
      ),
      opts.timeout,
      abortController
    )

    if (!response.ok && opts.throwHttpErrors) {
      if (opts.handleError) {
        await opts.handleError(response)
      }
      throw new HTTPError(response)
    }

    response.iterator = function () {
      return fromStream(response.body)
    }

    response.ndjson = async function * () {
      for await (const chunk of ndjson(response.iterator())) {
        if (options.transform) {
          yield options.transform(chunk)
        } else {
          yield chunk
        }
      }
    }

    return response
  }

  /**
   * @param {string | Request} resource
   * @param {HTTPOptions} options
   * @returns {Promise<Response>}
   */
  post (resource, options = {}) {
    return this.fetch(resource, { ...options, method: 'POST' })
  }

  /**
   * @param {string | Request} resource
   * @param {HTTPOptions} options
   * @returns {Promise<Response>}
   */
  get (resource, options = {}) {
    return this.fetch(resource, { ...options, method: 'GET' })
  }

  /**
   * @param {string | Request} resource
   * @param {HTTPOptions} options
   * @returns {Promise<Response>}
   */
  put (resource, options = {}) {
    return this.fetch(resource, { ...options, method: 'PUT' })
  }

  /**
   * @param {string | Request} resource
   * @param {HTTPOptions} options
   * @returns {Promise<Response>}
   */
  delete (resource, options = {}) {
    return this.fetch(resource, { ...options, method: 'DELETE' })
  }

  /**
   * @param {string | Request} resource
   * @param {HTTPOptions} options
   * @returns {Promise<Response>}
   */
  options (resource, options = {}) {
    return this.fetch(resource, { ...options, method: 'OPTIONS' })
  }
}

/**
 * Parses NDJSON chunks from an iterator
 *
 * @param {AsyncIterable<Uint8Array>} source
 * @returns {AsyncIterable<any>}
 */
const ndjson = async function * (source) {
  const decoder = new TextDecoder()
  let buf = ''

  for await (const chunk of source) {
    buf += decoder.decode(chunk, { stream: true })
    const lines = buf.split(/\r?\n/)

    for (let i = 0; i < lines.length - 1; i++) {
      const l = lines[i].trim()
      if (l.length > 0) {
        yield JSON.parse(l)
      }
    }
    buf = lines[lines.length - 1]
  }
  buf += decoder.decode()
  buf = buf.trim()
  if (buf.length !== 0) {
    yield JSON.parse(buf)
  }
}

/**
 * Stream to AsyncIterable
 *
 * @template TChunk
 * @param {ReadableStream<TChunk> | NodeReadableStream | null} source
 * @returns {AsyncIterable<TChunk>}
 */
const fromStream = (source) => {
  // Workaround for https://github.com/node-fetch/node-fetch/issues/766
  if (isNodeReadableStream(source)) {
    const iter = source[Symbol.asyncIterator]()
    return {
      [Symbol.asyncIterator] () {
        return {
          next: iter.next.bind(iter),
          return (value) {
            source.destroy()
            if (typeof iter.return === 'function') {
              return iter.return()
            }
            return Promise.resolve({ done: true, value })
          }
        }
      }
    }
  }

  if (isWebReadableStream(source)) {
    const reader = source.getReader()
    return (async function * () {
      try {
        while (true) {
          // Read from the stream
          const { done, value } = await reader.read()
          // Exit if we're done
          if (done) return
          // Else yield the chunk
          if (value) {
            yield value
          }
        }
      } finally {
        reader.releaseLock()
      }
    })()
  }

  if (isAsyncIterable(source)) {
    return source
  }

  throw new TypeError('Body can\'t be converted to AsyncIterable')
}

/**
 * Check if it's an AsyncIterable
 *
 * @template {unknown} TChunk
 * @template {any} Other
 * @param {Other|AsyncIterable<TChunk>} value
 * @returns {value is AsyncIterable<TChunk>}
 */
const isAsyncIterable = (value) => {
  return typeof value === 'object' &&
  value !== null &&
  typeof /** @type {any} */(value)[Symbol.asyncIterator] === 'function'
}

/**
 * Check for web readable stream
 *
 * @template {unknown} TChunk
 * @template {any} Other
 * @param {Other|ReadableStream<TChunk>} value
 * @returns {value is ReadableStream<TChunk>}
 */
const isWebReadableStream = (value) => {
  return value && typeof /** @type {any} */(value).getReader === 'function'
}

/**
 * @param {any} value
 * @returns {value is NodeReadableStream}
 */
const isNodeReadableStream = (value) =>
  Object.prototype.hasOwnProperty.call(value, 'readable') &&
  Object.prototype.hasOwnProperty.call(value, 'writable')

HTTP.HTTPError = HTTPError
HTTP.TimeoutError = TimeoutError
HTTP.streamToAsyncIterator = fromStream

/**
 * @param {string | Request} resource
 * @param {HTTPOptions} [options]
 * @returns {Promise<Response>}
 */
HTTP.post = (resource, options) => new HTTP(options).post(resource, options)

/**
 * @param {string | Request} resource
 * @param {HTTPOptions} [options]
 * @returns {Promise<Response>}
 */
HTTP.get = (resource, options) => new HTTP(options).get(resource, options)

/**
 * @param {string | Request} resource
 * @param {HTTPOptions} [options]
 * @returns {Promise<Response>}
 */
HTTP.put = (resource, options) => new HTTP(options).put(resource, options)

/**
 * @param {string | Request} resource
 * @param {HTTPOptions} [options]
 * @returns {Promise<Response>}
 */
HTTP.delete = (resource, options) => new HTTP(options).delete(resource, options)

/**
 * @param {string | Request} resource
 * @param {HTTPOptions} [options]
 * @returns {Promise<Response>}
 */
HTTP.options = (resource, options) => new HTTP(options).options(resource, options)

module.exports = HTTP
