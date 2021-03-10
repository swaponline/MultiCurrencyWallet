import { default as Swap } from 'swap.swap'
import * as flows from 'swap.flows'

import { orderView } from './views'


let _swaps = {}

const decodeFlow = (swap) => {
  const { isMy: isMyOrder, buyCurrency, sellCurrency } = swap

  const firstPart = isMyOrder ? sellCurrency : buyCurrency
  const lastPart  = isMyOrder ? buyCurrency : sellCurrency
  const flowName = `${firstPart.toUpperCase()}2${lastPart.toUpperCase()}`

  return flows[flowName]
}

const findOrder = (app) => (req, res, next) => {
  const id = req.params.id

  console.log(new Date().toISOString(), 'id', id)
  let order = app.services.orders.getByKey(id)
  if (!order) return res.status(404).json({ error: 'no such order' })

  next && next(order)

  return order
}

const findSwap = (app) => async (req, res) => {
  const id = req.params.id

  console.log(new Date().toISOString(), 'id', id)

  if (_swaps[id]) return _swaps[id]

  const swap = new Swap(id, app)
  _swaps[id] = swap

  return swap
}

export {
  decodeFlow,
  findSwap,
  findOrder,
}
