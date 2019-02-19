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

const getSwapById = (id) => new Swap(id, SwapApp.shared())

const getUserData = (currency) => {
  switch (currency.toUpperCase()) {
    case 'BTC':
      return getState().user.btcData

    case 'ETH':
      return getState().user.ethData

    default:
      return {}
  }
}

const setFilter = (filter) => {
  reducers.core.setFilter({ filter })
}

const acceptRequest = (orderId, participantPeer) => {
  const order = SwapApp.shared().services.orders.getByKey(orderId)
  order.acceptRequest(participantPeer)
}

const declineRequest = (orderId, participantPeer) => {
  const order = SwapApp.shared().services.orders.getByKey(orderId)
  order.declineRequest(participantPeer)
}

const removeOrder = (orderId) => {
  SwapApp.shared().services.orders.remove(orderId)
  actions.feed.deleteItemToFeed(orderId)
}

const showMyOrders = () => {
  console.log('showMyOrders')
  SwapApp.shared().services.orders.showMyOrders()
}

const hideMyOrders = () => {
  SwapApp.shared().services.orders.hideMyOrders()
}

const hasHiddenOrders = () => {
  return SwapApp.shared().services.orders.hasHiddenOrders()
}

const sendRequest = (orderId, destination = {}, callback) => {
  const { address: destinationAddress } = destination

  const order = SwapApp.shared().services.orders.getByKey(orderId)

  const userCurrencyData = getUserData(order.buyCurrency)
  const { address, reputation, reputationProof } = getUserData(order.buyCurrency)

  const requestOptions = {
    address: destinationAddress,
    participantMetadata: {
      address,
      reputation,
      reputationProof,
    },
  }

  order.sendRequest(callback, requestOptions)
}

const sendRequestForPartial = (orderId, newValues, destination = {}, callback) => {
  const { address: destinationAddress } = destination

  const order = SwapApp.shared().services.orders.getByKey(orderId)

  const { address, reputation, reputationProof } = getUserData(order.buyCurrency)

  const requestOptions = {
    address: destinationAddress,
    participantMetadata: {
      address,
      reputation,
      reputationProof,
    },
  }

  order.sendRequestForPartial(newValues, requestOptions,
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
    return SwapApp.shared().services.orders.create(data)
  }

  const order = SwapApp.shared().services.orders.create(data)

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
  SwapApp.shared().services.orders.requestToPeer(event, peer, data, callback)
}

const updateCore = () => {
  const orders = SwapApp.shared().services.orders.items

  getOrders(orders)
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
      ...SwapApp.shared().env.storage.getItem(`swap.${swapId}`),
      ...SwapApp.shared().env.storage.getItem(`flow.${swapId}`),
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
  hideMyOrders,
  showMyOrders,
  hasHiddenOrders,
}
