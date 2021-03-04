'use strict'

/* eslint-env mocha */
const { expect } = require('aegir/utils/chai')
const NativeFetch = require('../src')
const NodeFetch = require('node-fetch')
const globalthis = require('globalthis')()

describe('env', function () {
  it('fetch should be correct in each env', function () {
    switch (process.env.AEGIR_RUNNER) {
      case 'electron-main':
        expect(NativeFetch).to.equal(NodeFetch)
        expect(globalthis.fetch).to.be.undefined()
        break
      case 'electron-renderer':
        expect(NativeFetch).to.not.equal(NodeFetch)
        expect(NativeFetch.Headers).to.equal(globalthis.Headers)
        expect(NativeFetch.Request).to.equal(globalthis.Request)
        expect(NativeFetch.Response).to.equal(globalthis.Response)
        expect(globalthis.fetch).to.be.ok()
        break
      case 'node':
        expect(NativeFetch).to.equal(NodeFetch)
        expect(globalthis.fetch).to.be.undefined()
        break
      case 'browser':
        expect(NativeFetch).to.not.equal(NodeFetch)
        expect(NativeFetch.Headers).to.equal(globalthis.Headers)
        expect(NativeFetch.Request).to.equal(globalthis.Request)
        expect(NativeFetch.Response).to.equal(globalthis.Response)
        expect(globalthis.fetch).to.be.ok()
        break
      case 'webworker':
        expect(NativeFetch).to.not.equal(NodeFetch)
        expect(NativeFetch.Headers).to.equal(globalthis.Headers)
        expect(NativeFetch.Request).to.equal(globalthis.Request)
        expect(NativeFetch.Response).to.equal(globalthis.Response)
        expect(globalthis.fetch).to.be.ok()
        break
      default:
        expect.fail(`Could not detect env. Current env is ${process.env.AEGIR_RUNNER}`)
        break
    }
  })
})
