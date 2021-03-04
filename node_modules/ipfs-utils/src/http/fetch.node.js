'use strict'

const { Request, Response, Headers, default: nativeFetch } = require('../fetch')
// @ts-ignore
const toStream = require('it-to-stream')
const { Buffer } = require('buffer')
/**
 * @typedef {import('electron-fetch').BodyInit} BodyInit
 * @typedef {import('stream').Readable} NodeReadableStream
 *
 * @typedef {import('../types').FetchOptions} FetchOptions
 * @typedef {import('../types').ProgressFn} ProgressFn
 */

/**
 * @param {string|Request} url
 * @param {FetchOptions} [options]
 * @returns {Promise<Response>}
 */
const fetch = (url, options = {}) =>
  // @ts-ignore
  nativeFetch(url, withUploadProgress(options))

/**
 * Takes fetch options and wraps request body to track upload progress if
 * `onUploadProgress` is supplied. Otherwise returns options as is.
 *
 * @param {FetchOptions} options
 * @returns {FetchOptions}
 */
const withUploadProgress = (options) => {
  const { onUploadProgress, body } = options
  if (onUploadProgress && body) {
    // This works around the fact that electron-fetch serializes `Uint8Array`s
  // and `ArrayBuffer`s to strings.
    const content = normalizeBody(body)

    const rsp = new Response(content)
    const source = iterateBodyWithProgress(/** @type {NodeReadableStream} */(rsp.body), onUploadProgress)
    return {
      ...options,
      body: toStream.readable(source)
    }
  } else {
    return options
  }
}

/**
 * @param {BodyInit} input
 * @returns {Blob | FormData | URLSearchParams | ReadableStream<Uint8Array> | string | NodeReadableStream | Buffer}
 */
const normalizeBody = (input) => {
  if (input instanceof ArrayBuffer) {
    return Buffer.from(input)
  } else if (ArrayBuffer.isView(input)) {
    return Buffer.from(input.buffer, input.byteOffset, input.byteLength)
  } else if (typeof input === 'string') {
    return Buffer.from(input)
  }
  return input
}

/**
 * Takes body from native-fetch response as body and `onUploadProgress` handler
 * and returns async iterable that emits body chunks and emits
 * `onUploadProgress`.
 *
 * @param {NodeReadableStream | null} body
 * @param {ProgressFn} onUploadProgress
 * @returns {AsyncIterable<Buffer>}
 */
const iterateBodyWithProgress = async function * (body, onUploadProgress) {
  if (body == null) {
    onUploadProgress({ total: 0, loaded: 0, lengthComputable: true })
  } else if (Buffer.isBuffer(body)) {
    const total = body.byteLength
    const lengthComputable = true
    yield body
    onUploadProgress({ total, loaded: total, lengthComputable })
  } else {
    const total = 0
    const lengthComputable = false
    let loaded = 0
    for await (const chunk of body) {
      loaded += chunk.byteLength
      yield chunk
      onUploadProgress({ total, loaded, lengthComputable })
    }
  }
}

module.exports = {
  fetch,
  Request,
  Headers
}
