'use strict'

module.exports = {
  webpack: {
    node: {
      // this is needed until protocol-buffers stops using node core APIs in browser code
      os: true,
      Buffer: true
    }
  }
}
