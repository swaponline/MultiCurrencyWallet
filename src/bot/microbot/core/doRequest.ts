import { helpers } from 'simple.swap.core'

export default orders => async order =>
  new Promise(resolve => order.sendRequest(resolve))

// const { orders: { request } } = helpers
//
// export default request
