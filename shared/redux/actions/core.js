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

  setTimeout(() => {
    this.handleToggleTooltip()
  }, 800)

  updateCore()
}

const declineRequest = (orderId, participantPeer) => {
  const order = SwapApp.services.orders.getByKey(orderId)
  order.declineRequest(participantPeer)

  updateCore()
}

const removeOrder = (orderId) => {
  SwapApp.services.orders.remove(orderId)
  actions.feed.deleteItemToFeed(orderId)

  updateCore()
}

const sendRequest = (orderId) => {
  const order = SwapApp.services.orders.getByKey(orderId)

  order.sendRequest((isAccepted) => {
    console.log(`user ${order.owner.peer} ${isAccepted ? 'accepted' : 'declined'} your request`)
  })

  updateCore()
}

const updateCore = (orders) => {
  if (orders !== undefined && orders.length > 0) {
    getOrders(orders)
    actions.feed.getFeedDataFromOrder(orders)
  }
}

export default {
  getOrders,
  setFilter,
  updateCore,
  sendRequest,
  acceptRequest,
  declineRequest,
  removeOrder,
}
