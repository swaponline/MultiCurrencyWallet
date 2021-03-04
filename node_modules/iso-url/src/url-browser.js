'use strict'

function getDefaultBase () {
  if (!self.location) {
    return
  }

  if (!self.location.protocol || !self.location.host) {
    return
  }

  return self.location.protocol + '//' + self.location.host
}

const URL = self.URL
const defaultBase = getDefaultBase()

class URLWithLegacySupport {
  constructor (url = '', base = defaultBase) {
    this.super = new URL(url, base)
    this.path = this.pathname + this.search
    this.auth =
            this.username && this.password
              ? this.username + ':' + this.password
              : null

    this.query =
            this.search && this.search.startsWith('?')
              ? this.search.slice(1)
              : null
  }

  get hash () {
    return this.super.hash
  }

  get host () {
    return this.super.host
  }

  get hostname () {
    return this.super.hostname
  }

  get href () {
    return this.super.href
  }

  get origin () {
    return this.super.origin
  }

  get password () {
    return this.super.password
  }

  get pathname () {
    return this.super.pathname
  }

  get port () {
    return this.super.port
  }

  get protocol () {
    return this.super.protocol
  }

  get search () {
    return this.super.search
  }

  get searchParams () {
    return this.super.searchParams
  }

  get username () {
    return this.super.username
  }

  set hash (hash) {
    this.super.hash = hash
  }

  set host (host) {
    this.super.host = host
  }

  set hostname (hostname) {
    this.super.hostname = hostname
  }

  set href (href) {
    this.super.href = href
  }

  set password (password) {
    this.super.password = password
  }

  set pathname (pathname) {
    this.super.pathname = pathname
  }

  set port (port) {
    this.super.port = port
  }

  set protocol (protocol) {
    this.super.protocol = protocol
  }

  set search (search) {
    this.super.search = search
  }

  set username (username) {
    this.super.username = username
  }

  /**
   * @param {any} o
   */
  static createObjectURL (o) {
    return URL.createObjectURL(o)
  }

  /**
   * @param {string} o
   */
  static revokeObjectURL (o) {
    URL.revokeObjectURL(o)
  }

  toJSON () {
    return this.super.toJSON()
  }

  toString () {
    return this.super.toString()
  }

  format () {
    return this.toString()
  }
}

/**
 * @param {string | import('url').UrlObject} obj
 */
function format (obj) {
  if (typeof obj === 'string') {
    const url = new URL(obj)

    return url.toString()
  }

  if (!(obj instanceof URL)) {
    const userPass =
            // @ts-ignore its not supported in node but we normalise
            obj.username && obj.password
              // @ts-ignore its not supported in node but we normalise
              ? `${obj.username}:${obj.password}@`
              : ''
    const auth = obj.auth ? obj.auth + '@' : ''
    const port = obj.port ? ':' + obj.port : ''
    const protocol = obj.protocol ? obj.protocol + '//' : ''
    const host = obj.host || ''
    const hostname = obj.hostname || ''
    const search = obj.search || (obj.query ? '?' + obj.query : '')
    const hash = obj.hash || ''
    const pathname = obj.pathname || ''
    // @ts-ignore - path is not supported in node but we normalise
    const path = obj.path || pathname + search

    return `${protocol}${userPass || auth}${
            host || hostname + port
        }${path}${hash}`
  }
}

module.exports = {
  URLWithLegacySupport,
  URLSearchParams: self.URLSearchParams,
  defaultBase,
  format
}
