'use strict'

const {
  URLWithLegacySupport,
  format,
  URLSearchParams,
  defaultBase
} = require('./src/url')
const relative = require('./src/relative')

module.exports = {
  URL: URLWithLegacySupport,
  URLSearchParams,
  format,
  relative,
  defaultBase
}
