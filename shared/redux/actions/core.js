import reducers from 'redux/core/reducers'
import actions from 'redux/actions'
import { getState } from 'redux/core'
import SwapApp from 'swap.app'
import { constants } from 'helpers'


const getOrders = (orders) => {
  reducers.core.getOrders({ orders })
}

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

const sendRequest = (orderId, callback) => {
  const order = SwapApp.services.orders.getByKey(orderId)

  order.sendRequest(callback)
}

const createOrder = (data) => {
  SwapApp.services.orders.create(data)
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

  const historySwap = swapId.map(item => ({
    ...SwapApp.env.storage.getItem(`swap.${item}`),
    ...SwapApp.env.storage.getItem(`flow.${item}`),
  }))

  reducers.history.setSwapHistory(historySwap)
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
  getOrders,
  setFilter,
  createOrder,
  getSwapHistory,
  updateCore,
  sendRequest,
  acceptRequest,
  declineRequest,
  removeOrder,
  markCoinAsHidden,
  markCoinAsVisible,
}
