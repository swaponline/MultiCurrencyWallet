'use strict'
const debug = require('debug')
const log = debug('dns-over-http-resolver')
log.error = debug('dns-over-http-resolver:error')

const Receptacle = require('receptacle')

const {
  buildResource,
  fetch,
  getCacheKey
} = require('./utils')

/**
 * DNS over HTTP resolver.
 * Uses a list of servers to resolve DNS records with HTTP requests.
 */
class Resolver {
  /**
   * @class
   * @param {object} [properties]
   * @param {number} [properties.maxCache = 100] - maximum number of cached dns records.
   */
  constructor ({ maxCache = 100 } = {}) {
    this._cache = new Receptacle({ max: maxCache })
    this._servers = [
      'https://cloudflare-dns.com/dns-query',
      'https://dns.google/resolve'
    ]
  }

  /**
   * Get an array of the IP addresses currently configured for DNS resolution.
   * These addresses are formatted according to RFC 5952. It can include a custom port.
   *
   * @returns {Array<string>}
   */
  getServers () {
    return this._servers
  }

  /**
   * Get a shuffled array of the IP addresses currently configured for DNS resolution.
   * These addresses are formatted according to RFC 5952. It can include a custom port.
   *
   * @returns {Array<string>}
   */
  _getShuffledServers () {
    const newServers = [].concat(this._servers)

    for (let i = newServers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * i)
      const temp = newServers[i]
      newServers[i] = newServers[j]
      newServers[j] = temp
    }

    return newServers
  }

  /**
   * Sets the IP address and port of servers to be used when performing DNS resolution.
   *
   * @param {Array<string>} servers - array of RFC 5952 formatted addresses.
   */
  setServers (servers) {
    this._servers = servers
  }

  /**
   * Uses the DNS protocol to resolve the given host name into the appropriate DNS record.
   *
   * @param {string} hostname - host name to resolve.
   * @param {string} [rrType = 'A'] - resource record type.
   * @returns {Promise<*>}
   */
  resolve (hostname, rrType = 'A') {
    switch (rrType) {
      case 'A':
        return this.resolve4(hostname)
      case 'AAAA':
        return this.resolve6(hostname)
      case 'TXT':
        return this.resolveTxt(hostname)
      default:
        throw new Error(`${rrType} is not supported`)
    }
  }

  /**
   * Uses the DNS protocol to resolve the given host name into IPv4 addresses.
   *
   * @param {string} hostname - host name to resolve.
   * @returns {Promise<Array<string>>}
   */
  async resolve4 (hostname) {
    const recordType = 'A'
    const cached = this._cache.get(getCacheKey(hostname, recordType))
    if (cached) {
      return cached
    }

    for (const server of this._getShuffledServers()) {
      try {
        const response = await fetch(buildResource({
          serverResolver: server,
          hostname,
          recordType
        }))

        const d = await response.json()
        const data = d.Answer.map(a => a.data)
        const ttl = Math.min(d.Answer.map(a => a.TTL))

        this._cache.set(getCacheKey(hostname, recordType), data, { ttl })

        return data
      } catch (err) {
        log.error(`${server} could not resolve ${hostname} record ${recordType}`)
      }
    }

    throw new Error(`Could not resolve ${hostname} record ${recordType}`)
  }

  /**
   * Uses the DNS protocol to resolve the given host name into IPv6 addresses.
   *
   * @param {string} hostname - host name to resolve.
   * @returns {Promise<Array<string>>}
   */
  async resolve6 (hostname) {
    const recordType = 'AAAA'
    const cached = this._cache.get(getCacheKey(hostname, recordType))
    if (cached) {
      return cached
    }

    for (const server of this._getShuffledServers()) {
      try {
        const response = await fetch(buildResource({
          serverResolver: server,
          hostname,
          recordType
        }))

        const d = await response.json()
        const data = d.Answer.map(a => a.data)
        const ttl = Math.min(d.Answer.map(a => a.TTL))

        this._cache.set(getCacheKey(hostname, recordType), data, { ttl })

        return data
      } catch (err) {
        log.error(`${server} could not resolve ${hostname} record ${recordType}`)
      }
    }

    throw new Error(`Could not resolve ${hostname} record ${recordType}`)
  }

  /**
   * Uses the DNS protocol to resolve the given host name into a Text record.
   *
   * @param {string} hostname - host name to resolve.
   * @returns {Promise<Array<Array<string>>>}
   */
  async resolveTxt (hostname) {
    const recordType = 'TXT'
    const cached = this._cache.get(getCacheKey(hostname, recordType))
    if (cached) {
      return cached
    }

    for (const server of this._getShuffledServers()) {
      try {
        const response = await fetch(buildResource({
          serverResolver: server,
          hostname,
          recordType
        }))

        const d = await response.json()
        const data = d.Answer.map(a => [a.data.replace(/['"]+/g, '')])
        const ttl = Math.min(d.Answer.map(a => a.TTL))

        this._cache.set(getCacheKey(hostname, recordType), data, { ttl })

        return data
      } catch (err) {
        log.error(`${server} could not resolve ${hostname} record ${recordType}`)
      }
    }

    throw new Error(`Could not resolve ${hostname} record ${recordType}`)
  }
}

Resolver.Resolver = Resolver
module.exports = Resolver
