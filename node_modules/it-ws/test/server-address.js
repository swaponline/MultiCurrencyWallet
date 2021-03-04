var WS = require('../')
var tape = require('tape')

tape('server .address should return bound address', async function (t) {
  var server = WS.createServer()
  await server.listen(55214)
  t.equal(typeof server.address, 'function')
  t.equal(server.address().port, 55214, 'return address should match')
  await server.close()
  t.end()
})
