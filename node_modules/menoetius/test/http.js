const defaults = require('../lib/defaults')
const http = require('http')
const epithemeus = require('../index')
const assertExpectations = require('./assert-expectations')

function setup (options) {
  return describe('native ' + options.url, () => {
    before((done) => {
      this.server = http.createServer((req, res) => {
        if (req.url !== options.url) {
          res.statusCode = 200
          res.end()
        }
      })

      epithemeus.instrument(this.server, options)

      return this.server.listen(3000, '127.0.0.1', done)
    })

    after((done) => {
      return this.server.close(done)
    })

    assertExpectations(options)
  })
}

setup(defaults())
setup({
  url: '/xxx'
})
