import BigNumber from 'bignumber.js'

import fetchPrice from '../../../app/actions/fetchPrice'
import handleError from '../../../app/actions/errors/handleError'

import Pair from '../../Pair'

import proceed from './doRequest'


export default (app, orders) => async (order) => {
  console.log(new Date().toISOString(), `new order ${order.id}`)
  if (order.isMy) return

  // turn off autorequest
  // return

  const fee = new BigNumber(0.01)

  let pair
  try {
    pair = Pair.fromOrder(order)

    console.log(new Date().toISOString(), `[ORDER] my=${order.isMy ? 1 : 0}, ${pair}`)
  } catch (err) {
    return false
  }

  let marketPrice
  try {
    marketPrice = await fetchPrice(pair)
  } catch (err) {
    handleError(err)
  }

  console.log(new Date().toISOString(), `[PRICE] market: ${marketPrice}`)
  console.log(new Date().toISOString(), `${pair} ${pair.price.minus(fee)} ${(marketPrice)}`)

  const _ok =
    (pair.isBid() && pair.price.minus(fee).isGreaterThan(marketPrice)) ||
    (pair.isAsk() && pair.price.plus(fee).isLessThan(marketPrice))

  console.log(new Date().toISOString(), 'ok', _ok)
  if (_ok) proceed(app, orders)(order)

  // if not, just ignore
  // TODO mark this order so we don't touch it for a while
}
