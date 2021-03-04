/* eslint no-unreachable: "warn" */

'use strict'

const Hapi = require('@hapi/hapi')
const Inert = require('@hapi/inert')

const config = require('./config')
const log = config.log
const menoetius = require('menoetius')
const path = require('path')

module.exports = {
  start: async (options = {}) => {
    const port = options.port || config.hapi.port
    const host = options.host || config.hapi.host

    const http = new Hapi.Server({
      ...config.hapi.options,
      port,
      host
    })

    await http.register(Inert)
    await http.start()

    log('signaling server has started on: ' + http.info.uri)

    const peers = require('./routes-ws')(http, options.metrics).peers
    const next = require('./routes-ws/next')(http, options.metrics).peers

    http.peers = () => ({
      ...peers(),
      ...next()
    })

    http.route({
      method: 'GET',
      path: '/',
      handler: (request, reply) => reply.file(path.join(__dirname, 'index.html'), {
        confine: false
      })
    })

    if (options.metrics) {
      log('enabling metrics')
      await menoetius.instrument(http)
    }

    return http
  }
}
