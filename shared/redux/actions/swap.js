import reducers from 'redux/core/reducers'
import { swapApp } from 'instances/swap'


const update = () => reducers.swap.update(swapApp.orderCollection.items)

const create = (data) => {
  swapApp.createOrder(data)
  reducers.swap.update(swapApp.orderCollection.items)
}

const remove = (orderId) => {
  swapApp.removeOrder(orderId)
  reducers.swap.update(swapApp.orderCollection.items)
}

const sendRequest = (orderId) => {
  const order = swapApp.orderCollection.getByKey(orderId)

  order.sendRequest((isAccepted) => {
    console.log(`user ${order.owner.peer} ${isAccepted ? 'accepted' : 'declined'} your request`)
  })
}

export default {
  update,
  create,
  remove,
  sendRequest,
}