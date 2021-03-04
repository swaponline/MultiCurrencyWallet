'use strict'

const { TimeoutError, AbortError } = require('./error')
const { Response, Request, Headers, default: fetch } = require('../fetch')

/**
 * @typedef {import('../types').FetchOptions} FetchOptions
 * @typedef {import('../types').ProgressFn} ProgressFn
 */

/**
 * Fetch with progress
 *
 * @param {string | Request} url
 * @param {FetchOptions} [options]
 * @returns {Promise<ResponseWithURL>}
 */
const fetchWithProgress = (url, options = {}) => {
  const request = new XMLHttpRequest()
  request.open(options.method || 'GET', url.toString(), true)

  const { timeout, headers } = options

  if (timeout && timeout > 0 && timeout < Infinity) {
    request.timeout = timeout
  }

  if (options.overrideMimeType != null) {
    request.overrideMimeType(options.overrideMimeType)
  }

  if (headers) {
    for (const [name, value] of new Headers(headers)) {
      request.setRequestHeader(name, value)
    }
  }

  if (options.signal) {
    options.signal.onabort = () => request.abort()
  }

  if (options.onUploadProgress) {
    request.upload.onprogress = options.onUploadProgress
  }

  // Note: Need to use `arraybuffer` here instead of `blob` because `Blob`
  // instances coming from JSDOM are not compatible with `Response` from
  // node-fetch (which is the setup we get when testing with jest because
  // it uses JSDOM which does not provide a global fetch
  // https://github.com/jsdom/jsdom/issues/1724)
  request.responseType = 'arraybuffer'

  return new Promise((resolve, reject) => {
    /**
     * @param {Event} event
     */
    const handleEvent = (event) => {
      switch (event.type) {
        case 'error': {
          resolve(Response.error())
          break
        }
        case 'load': {
          resolve(
            new ResponseWithURL(request.responseURL, request.response, {
              status: request.status,
              statusText: request.statusText,
              headers: parseHeaders(request.getAllResponseHeaders())
            })
          )
          break
        }
        case 'timeout': {
          reject(new TimeoutError())
          break
        }
        case 'abort': {
          reject(new AbortError())
          break
        }
        default: {
          break
        }
      }
    }
    request.onerror = handleEvent
    request.onload = handleEvent
    request.ontimeout = handleEvent
    request.onabort = handleEvent

    request.send(/** @type {BodyInit} */(options.body))
  })
}

const fetchWithStreaming = fetch

/**
 * @param {string | Request} url
 * @param {FetchOptions} options
 */
const fetchWith = (url, options = {}) =>
  (options.onUploadProgress != null)
    ? fetchWithProgress(url, options)
    : fetchWithStreaming(url, options)

/**
 * Parse Headers from a XMLHttpRequest
 *
 * @param {string} input
 * @returns {Headers}
 */
const parseHeaders = (input) => {
  const headers = new Headers()
  for (const line of input.trim().split(/[\r\n]+/)) {
    const index = line.indexOf(': ')
    if (index > 0) {
      headers.set(line.slice(0, index), line.slice(index + 1))
    }
  }

  return headers
}

class ResponseWithURL extends Response {
  /**
   * @param {string} url
   * @param {BodyInit} body
   * @param {ResponseInit} options
   */
  constructor (url, body, options) {
    super(body, options)
    Object.defineProperty(this, 'url', { value: url })
  }
}

module.exports = {
  fetch: fetchWith,
  Request,
  Headers,
  ResponseWithURL
}
