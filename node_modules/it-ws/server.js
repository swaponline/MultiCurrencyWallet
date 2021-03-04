var ws = require('./')
var WebSocket = require('ws')
var http = require('http')
var https = require('https')

var EventEmitter = require('events').EventEmitter
module.exports = !WebSocket.Server ? null : function (opts, onConnection) {
  var emitter = new EventEmitter()

  if (typeof opts === 'function') {
    onConnection = opts
    opts = null
  }
  opts = opts || {}

  if (onConnection) {
    emitter.on('connection', onConnection)
  }

  function proxy (server, event) {
    return server.on(event, function () {
      var args = [].slice.call(arguments)
      args.unshift(event)
      emitter.emit.apply(emitter, args)
    })
  }

  var server = opts.server ||
    (opts.key && opts.cert ? https.createServer(opts) : http.createServer())

  var wsServer = new WebSocket.Server({
    server: server,
    perMessageDeflate: false,
    verifyClient: opts.verifyClient
  })

  proxy(server, 'listening')
  proxy(server, 'request')
  proxy(server, 'close')

  wsServer.on('connection', function (socket, req) {
    var stream = ws(socket)
    const addr = wsServer.address()

    stream.localAddress = addr.address
    stream.localPort = addr.port
    stream.remoteAddress = req.socket.remoteAddress
    stream.remotePort = req.socket.remotePort
    stream.close = () => new Promise((resolve) => {
      socket.addEventListener('close', resolve)
      socket.close()
    })
    stream.destroy = () => socket.terminate()
    stream.socket = socket

    emitter.emit('connection', stream, req)
  })

  emitter.listen = function (addr) {
    return new Promise(resolve => {
      emitter.once('listening', () => resolve(emitter))
      server.listen(addr.port || addr)
    })
  }

  emitter.close = function () {
    return new Promise(resolve => {
      server.close(resolve)
      wsServer.close()
    })
  }

  emitter.address = server.address.bind(server)
  return emitter
}
