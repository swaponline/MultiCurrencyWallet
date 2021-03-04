/* eslint-env mocha */

const defaults = require('../lib/defaults')
const Hapi = require('hapi')
const epithemeus = require('../index')
const assertExpectations = require('./assert-expectations')

function setup (options) {
  return describe('hapi ' + options.url, () => {
    before(async () => {
      this.server = Hapi.Server({ port: 3000 })

      await epithemeus.instrument(this.server, options)

      this.server.route({
        method: 'GET',
        path: '/',
        handler: async (request, h) => {
          return h.response()
        }
      })

      this.server.route({
        method: 'GET',
        path: '/resource/101',
        handler: async (request, h) => {
          return h.response()
        }
      })

      return await this.server.start()

    })

    after(async () => {
      return await this.server.stop()
    })

    assertExpectations(options)
  })
}

setup(defaults())
setup({
  url: '/xxx'
})
