import WebSocket from 'ws'
import http from 'http'

import { util } from 'swap.app'


const WS_PORT = 7333

const init = (app, SwapApp, router, port) => {
  const server = http.createServer(app)

  // initialize the WebSocket server instance
  const wss = new WebSocket.Server({ server })

  const swap = SwapApp.services

  const json = (obj) => JSON.stringify(obj)

  const cleanOrder = (order) =>
    util.pullProps(
      order,
      'id',
      'owner',
      'buyCurrency',
      'sellCurrency',
      'buyAmount',
      'sellAmount',
      'isRequested',
      'isProcessing'
    )

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false)
        return ws.terminate()

      ws.isAlive = false
      ws.ping(() => {})
    })
  }, 30000)

  const pipe = (from, to, type, handler = (a) => a) => {
    from.on(type, (payload) => {
      safeSend(to, {
        event: type,
        payload: handler(payload),
      })
    })
  }

  const safeSend = (to, message) => {
    try {
      to.isAlive && to.send(json(message))
    } catch ({ name, message }) {
      if (!wss.clients.has(to) || /WebSocket is not open/g.test(message)) {
        return to.terminate()
      }
      //@ts-ignore
      safeSend(ws, { error: { name, message } })
    }
  }

  wss.on('connection', (ws) => {
    ws.isAlive = true

    ws.on('pong', () => (ws.isAlive = true))
    ws.on('close', () => (ws.isAlive = false))

    ws.send(json({
      event: 'ready',
      payload: 'server',
    }))

    ws.send(json({
      event: 'ready',
      payload: {
        mainnet: SwapApp.isMainNet()
      }
    }))

    pipe(swap.room, ws, 'ready', () => ({
      event: 'ready',
      payload: {
        service: 'room',
        room: swap.room.roomName,
        peer: swap.room.peer,
      },
    }))

    pipe(swap.room, ws, 'user online')
    pipe(swap.room, ws, 'user offline')

    pipe(swap.room, ws, 'accept swap request')
    pipe(swap.room, ws, 'decline swap request')

    pipe(swap.orders, ws, 'new order request')

    pipe(swap.orders, ws, 'new orders', (orders) => orders.map(cleanOrder))
    pipe(swap.orders, ws, 'new order', (payload) => cleanOrder(payload))
    pipe(swap.orders, ws, 'remove order', () => {})

    const stopListening = () => {
      swap.room.off('ready')
      swap.room.off('user online')
      swap.room.off('user offline')
      swap.room.off('accept swap request')
      swap.room.off('decline swap request')

      swap.orders.off('new order')
      swap.orders.off('new orders')
      swap.orders.off('new order request')
      swap.orders.off('remove order')
    }

    ws.on('close', stopListening)
  })

  const portUsed = port || WS_PORT

  server.listen(portUsed, () => {
    console.log(`[WS] listening on port ${portUsed}`)
  })

  return wss
}

export default { init }
