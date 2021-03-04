//@ts-nocheck
import Swap from 'swap.swap'
import debug from 'debug'

import checkService from './checkService'

export const request = order =>
  new Promise((resolve, reject) =>
    order.sendRequest(accepted => {
      if (accepted) {
        resolve(order)
      }
    })
  ).then(order => {
    //@ts-nocheck
    debug('swap.core:simple:orders')('order accepted', order.id)
    //@ts-nocheck
    return new Swap(order.id)
  })

export const subscribe = (orders, handler) => {
  checkService(orders, 'orders')

  orders.on('new order', (order) => handler(order))
  orders.on('new orders', (orders) => orders.map(handler))
}
