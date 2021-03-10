import swapApp from '../../swapApp'

import { findOrder, orderView } from '../../helpers'


const app = swapApp.app
const Orders = swapApp.app.services.orders

let orders


const listMyOrders = (req, res) => {
  orders = Orders.getMyOrders().filter(order => !!order)
  orders = orders.map(orderView)

  res.json(orders)
}

const listOthersOrders = (req, res) => {
  orders = Orders.items.filter(order => !!order)
  orders = orders.filter(order => !order.isMy)
  orders = orders.map(orderView)

  res.json(orders)
}

const listOrders = (req, res) => {
  orders = Orders.items.filter(order => !!order)
  orders = Orders.items.filter(order => !order.isProcessing)
  orders = orders.map(orderView)

  res.json(orders)
}

const listAllOrders = (req, res) => {
  orders = Orders.items.filter(order => !!order)
  orders = orders.map(orderView)

  res.json(orders)
}

const filterOrders = (req, res) => {
  const peer = req.query.peer
  const isProcessing = req.query.isProcessing

  orders = Orders.items.filter(order => !!order)

  if (peer !== undefined)
    orders = orders.filter(order => order.owner.peer == peer)

  if (isProcessing === 'false' || isProcessing === 'true') {
    const filterProcessing = isProcessing == 'true'
    orders = orders.filter(order => order.isProcessing === filterProcessing)
  }

  orders = orders.map(orderView)

  res.json(orders)
}

const requestedOrders = (req, res) => {
  orders = Orders.items.filter(order => !!order)

  orders = orders.filter(({ requests }) => requests.length)
  orders = orders.map(orderView)

  res.json(orders)
}

const getOrder = (req, res) => {
  findOrder(app)(req, res, (order) => res.json(orderView(order)))
}

const createOrder = (req, res) => {
  try {
    const { buyCurrency, sellCurrency, buyAmount, sellAmount, exchangeRate } = req.body
    const data = { buyCurrency, sellCurrency, buyAmount, sellAmount, exchangeRate }

    const order = Orders.create(data)
    console.log(new Date().toISOString(), 'new order', data)

    res.status(201).json(orderView(order))
  } catch (err) {
    res.status(400).json({ error: 'cant create ' + err })
    throw err
  }
}

const deleteOrder = (req, res) => {
  try {
    findOrder(app)(req, res, (order) => {
      Orders.remove(order.id)
      res.status(200).json({})
    })
  } catch (err) {
    res.status(400).json({ error: 'cant delete ' + err })
    throw err
  }
}

const deleteAllOrders = (req, res) => {
  try {
    Orders.getMyOrders()
      .filter(order => !order.isProcessing)
      .map(order => Orders.remove(order.id))

    res.status(200).json({})
  } catch (err) {
    res.status(400).json({ error: 'cant delete ' + err })
    throw err
  }
}

const forceDeleteAllOrders = (req, res) => {
  try {
    Orders.getMyOrders()
      .map(order => Orders.remove(order.id))

    res.status(200).json({})
  } catch (err) {
    res.status(400).json({ error: 'cant delete ' + err })
    throw err
  }
}

const requestOrder = (req, res) => {
  findOrder(app)(req, res, (order) => {
    order.sendRequest(accepted => {
      order.isAccepted = accepted
      console.log(new Date().toISOString(), 'accepted', accepted)
      if (!accepted) return
      console.log(new Date().toISOString(), 'peer accepted order', orderView(order))
    })

    order.isAccepted = false
    res.json(orderView(order))
  })
}

const requestPartialFulfilment = (req, res) => {
  const buyAmount = req.query.buyAmount
  const sellAmount = req.query.sellAmount
  const updatedOrder = { buyAmount, sellAmount }

  if(!buyAmount && !sellAmount)
    return res.status(404).json({ error: 'no updatedOrder buyAmount or sellAmount given' })

  findOrder(app)(req, res, (order) => {
    order.sendRequestForPartial(updatedOrder, (newOrder, accepted) => {
      console.log('accepted', accepted)
      order.isAccepted = accepted

      if (!accepted) return res.status(400).json(orderView(newOrder || {}))

      console.log(new Date().toISOString(), 'peer accepted order', orderView(newOrder))

      res.json(orderView(newOrder))
    }, newOrderId => true)
  })
}

const acceptRequest = (req, res) => {
  findOrder(app)(req, res, (order) => {
    let peer = req.params.peer

    if (order.requests.length == 1)
      peer = order.requests[0].peer

    if (!peer)
      return res.status(404).json({ error: 'no peer' })

    order.acceptRequest(peer)

    console.log(new Date().toISOString(), 'peer', peer)
    console.log(new Date().toISOString(), 'accepting order', orderView(order))

    res.json(orderView(order))
  })
}


export {
  filterOrders,
  listOrders,
  listAllOrders,
  listMyOrders,
  listOthersOrders,
  requestedOrders,

  getOrder,
  createOrder,
  deleteOrder,
  deleteAllOrders,
  forceDeleteAllOrders,

  requestOrder,
  acceptRequest,
  requestPartialFulfilment,
}
