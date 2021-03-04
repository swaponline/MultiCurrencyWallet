const defaults = require('../lib/defaults')
const express = require('express')
const epithemeus = require('../index')
const assertExpectations = require('./assert-expectations')
const assert = require('chai').assert
const libExpress = require('../lib/express')

function setup (options) {
  return describe('express ' + options.url, () => {
    before((done) => {
      const app = express()
      epithemeus.instrument(app, options)
      app.get('/', (req, res) => {
        res.send()
      })
      app.get('/resource/:id', (req, res) => {
        res.send()
      })
      this.server = app.listen(3000, done)
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

describe('express should check "instrumentablity" properly', () => {
  it('should return true when express conditions are correct', () => {
    // Arrange
    const server = () => {}
    server.defaultConfiguration = { sample: true }
    server.use = () => {}

    // Act
    const actual = libExpress.instrumentable(server)

    // Assert
    assert.isTrue(!!actual)
  })

  it('should return false when no server passed', () => {
    // Act
    const actual = libExpress.instrumentable()

    // Assert
    assert.isFalse(!!actual)
  })

  it('should return false when server does not have a default configuration', () => {
    // Arrange
    const server = () => {}
    server.use = () => {}

    // Act
    const actual = libExpress.instrumentable(server)

    // Assert
    assert.isFalse(!!actual)
  })

  it('should return false when server does not have a use function', () => {
    // Arrange
    const server = () => {}
    server.defaultConfiguration = { sample: true }

    // Act
    const actual = libExpress.instrumentable(server)

    // Assert
    assert.isFalse(!!actual)
  })
})
