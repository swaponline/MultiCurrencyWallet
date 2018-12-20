import reducers from 'redux/core/reducers'
import actions from 'redux/actions'
import { getState } from 'redux/core'
import SwapApp from 'swap.app'
import Swap from 'swap.swap'
import { constants } from 'helpers'
import Pair from 'pages/Home/Orders/Pair'


const debug = (...args) => console.log(...args)

const getOrders = (orders) => {
  reducers.core.getOrders({ orders })
}

const getSwapById = (id) => new Swap(id)

const setFilter = (filter) => {
  reducers.core.setFilter({ filter })
}

const acceptRequest = (orderId, participantPeer) => {
  const order = SwapApp.services.orders.getByKey(orderId)
  order.acceptRequest(participantPeer)
}

const declineRequest = (orderId, participantPeer) => {
  const order = SwapApp.services.orders.getByKey(orderId)
  order.declineRequest(participantPeer)
}

const removeOrder = (orderId) => {
  SwapApp.services.orders.remove(orderId)
  actions.feed.deleteItemToFeed(orderId)
}

const sendRequest = (orderId, { address } = {}, callback) => {
  const order = SwapApp.services.orders.getByKey(orderId)

  const destination = {
    address,
  }

  order.sendRequest(callback, destination)
}

const sendRequestForPartial = (orderId, newValues, destination, callback) => {
  const order = SwapApp.services.orders.getByKey(orderId)

  order.sendRequestForPartial(newValues, destination,
    (newOrder, isAccepted) => {
      console.error('newOrder', newOrder)
      console.error('newOrder', isAccepted)

      callback(newOrder, isAccepted)
    },
    (oldOrder, newOrder) => {
      const oldPrice = Pair.fromOrder(oldOrder).price
      const newPrice = Pair.fromOrder(newOrder).price

      console.log('prices', oldPrice.toString(), newPrice.toString())
      // | new - old | / old < 5%
      return newPrice.minus(oldPrice).abs().div(oldPrice).isLessThanOrEqualTo(0.05)
    }
  )
}

const createOrder = (data, isPartial = false) => {
  if (!isPartial) {
    return SwapApp.services.orders.create(data)
  }

  const order = SwapApp.services.orders.create(data)

  const { price } = Pair.fromOrder(order)

  order.setRequestHandlerForPartial('sellAmount', ({ sellAmount }, oldOrder) => {
    const oldPair = Pair.fromOrder(oldOrder)

    debug('oldPair', oldPair)

    // if BID, then
    // price == buyAmount / sellAmount

    const buyAmount = oldPair.isBid()
      ? sellAmount.div(price)
      : sellAmount.times(price)

    debug('newBuyAmount', buyAmount)

    const newOrder = ({ sellAmount, buyAmount })

    debug('newOrder', newOrder)

    return newOrder
  })

  order.setRequestHandlerForPartial('buyAmount', ({ buyAmount }, oldOrder) => {
    const oldPair = Pair.fromOrder(oldOrder)

    debug('oldPair', oldPair)
    // BUY [main] = SELL [base] CURRENCY
    // price = [main]/[base] = [buy]/[sell]

    // BUY 10 ETH = SELL 1 BTC
    // price = 10 = buyAmount / sellAmount
    // newSellAmount = buyAmount / price

    const sellAmount = oldPair.isBid()
      ? buyAmount.times(price)
      : buyAmount.div(price)


    debug('newSellAmount', sellAmount)

    const newOrder = ({ sellAmount, buyAmount })

    debug('newOrder', newOrder)

    return newOrder
  })

  return order
}

const requestToPeer = (event, peer, data, callback) => {
  SwapApp.services.orders.requestToPeer(event, peer, data, callback)
}

const updateCore = () => {
  const orders = SwapApp.services.orders.items

  getOrders(orders)
  getSwapHistory()
  actions.feed.getFeedDataFromOrder(orders)
}

const getSwapHistory = () => {
  const swapId = JSON.parse(localStorage.getItem('swapId'))

  if (swapId === null || swapId.length === 0) {
    return
  }

  const historySwap = swapId.map(item => getInformationAboutSwap(item))

  reducers.history.setSwapHistory(historySwap)
}

const getInformationAboutSwap = (swapId) => {
  if (swapId.length > 0 && typeof swapId === 'string') {
    return {
      ...SwapApp.env.storage.getItem(`swap.${swapId}`),
      ...SwapApp.env.storage.getItem(`flow.${swapId}`),
    }
  }
}

const markCoinAsHidden = (coin) => {
  let list = getState().core.hiddenCoinsList || []
  if (!list.includes(coin)) {
    reducers.core.markCoinAsHidden(coin)
    localStorage.setItem(constants.localStorage.hiddenCoinsList, JSON.stringify(getState().core.hiddenCoinsList))
  }
}

const markCoinAsVisible = (coin) => {
  reducers.core.markCoinAsVisible(coin)
  localStorage.setItem(constants.localStorage.hiddenCoinsList, JSON.stringify(getState().core.hiddenCoinsList))
}

export default {
  getSwapById,
  getOrders,
  setFilter,
  createOrder,
  getSwapHistory,
  updateCore,
  sendRequest,
  sendRequestForPartial,
  acceptRequest,
  declineRequest,
  removeOrder,
  markCoinAsHidden,
  markCoinAsVisible,
  requestToPeer,
  getInformationAboutSwap,
}
