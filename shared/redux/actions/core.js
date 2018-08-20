import reducers from 'redux/core/reducers'
import actions from 'redux/actions'
import { getState } from 'redux/core'
import SwapApp from 'swap.app'


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

const sendRequest = (orderId) => {
  const order = SwapApp.services.orders.getByKey(orderId)

  order.sendRequest((isAccepted) => {
    console.log(`user ${order.owner.peer} ${isAccepted ? 'accepted' : 'declined'} your request`)
  })
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
}
