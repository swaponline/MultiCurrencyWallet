const metrics = require('./metrics')

function plugin (server, options) {
  return {
    name: 'menoetius',
    version: '1.0.0',
    register: (server, o) => {
      server.route({
        method: 'GET',
        path: options.url,
        handler: async (request, h) => {
          return h.response(metrics.summary()).type('text/plain')
        }
      })

      server.ext('onRequest', async (request, h) => {
        request.menoetius = {
          start: process.hrtime()
        }

        return h.continue;
      })

      server.events.on('response', (response) => {
        metrics.observe(response.method, response.path, response.response.statusCode, response.menoetius.start)
      })
    }
  }
}

function instrument (server, options) {
  return server.register([plugin(server, options)])
}

function instrumentable (server) {
  return server && !server.use && server.register
}

module.exports = {
  instrumentable: instrumentable,
  instrument: instrument
}
