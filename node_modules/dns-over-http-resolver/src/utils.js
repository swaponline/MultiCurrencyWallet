'use strict'

const { default: nativeFetch, Headers } = require('native-fetch')

/**
 * Build fetch resource for request.
 *
 * @param {object} properties
 * @param {string} properties.serverResolver
 * @param {string} properties.hostname
 * @param {string} properties.recordType
 * @returns {string}
 */
function buildResource ({ serverResolver, hostname, recordType }) {
  return `${serverResolver}?name=${hostname}&type=${recordType}`
}

module.exports.buildResource = buildResource

/**
 * Use fetch to find the record.
 *
 * @param {object} resource
 * @returns {Promise}
 */
function fetch (resource) {
  return nativeFetch(resource, {
    headers: new Headers({
      accept: 'application/dns-json'
    })
  })
}

module.exports.fetch = fetch

/**
 * Creates cache key composed by recordType and hostname.
 *
 * @param {string} hostname
 * @param {string} recordType
 * @returns {string}
 */
function getCacheKey (hostname, recordType) {
  return `${recordType}_${hostname}`
}

module.exports.getCacheKey = getCacheKey
