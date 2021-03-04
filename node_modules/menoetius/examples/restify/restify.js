const restify = require('restify')
const menoetius = require('menoetius')

const server = restify.createServer()
menoetius.instrument(server)

server.get('/', function (req, res, done) {
  var high = 500, low = 150

  setTimeout(() => {
    res.send()
    return done()
  }, Math.floor(Math.random() * (high - low) + low))
})

server.listen(8001, () => {
  console.log('restify listening on 8001')
})
