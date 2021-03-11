import beginSwap from '../start/beginSwap'
import handleError from '../../../app/actions/errors/handleError'

import doRequest from '../../core/doRequest'


export default (app, orders) => async (order) => {
  const timeout = setTimeout(() =>
    handleError(new Error(`timeout on requesting order ${order.id}`)),
  10 * 1000)

  console.log(new Date().toISOString(), `request order ${order.id}`)
  const accepted = await doRequest(order)

  console.log(new Date().toISOString(), `accepted`, accepted)

  clearTimeout(timeout)

  if (!accepted) return handleError(new Error(`reject on order ${order}`))

  beginSwap(app, order, (swap) => orders.create(swap))
}
