
import express from 'express'

const server = express()
const bodyparser = require('body-parser')
const path = require('path')

const { app, wallet } = require('./swapApp')
const ws = require('./ws')

const router = require('./routes')
const auth = require('./routes/auth')

app.ready = new Promise( resolve => app.services.room.once('ready', resolve))
app.sync = new Promise( resolve => app.ready.then(() => setTimeout(resolve, 20000)) )

app.services.room.once('ready', () => {
  console.log('swapApp ready')

  console.log('btc', wallet.auth.accounts.btc.getAddress())
  console.log('eth', wallet.auth.accounts.eth.address)

  console.log('created swap app, me:', wallet.view())
})

const port = process.env.PORT || 1337
const ws_port = process.env.WS_PORT || 7333
const listen_ip = process.env.IP || '0.0.0.0'

server.use(auth)
server.use(express.static(path.join(__dirname, '/routes/web/')))
server.use(bodyparser.json())
server.use('/', router)

process.env.ENABLE_WEBSOCKET && ws.init(server, app, router, ws_port)

const listener = server.listen(port, listen_ip)
console.log(`[SERVER] listening on http://localhost:${port}`)
console.log('Run bot...')
exports = module.exports = { server, app, listener }
