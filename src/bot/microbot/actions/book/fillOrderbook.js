import BigNumber from 'bignumber.js'
import _debug from 'debug'

import handleError from '../../../app/actions/errors/handleError'
import fetchPrice from '../../../app/actions/fetchPrice'
import Pair from '../../Pair'

import {
  TRADE_CONFIG,
  TRADE_ORDER_MINAMOUNTS,
  TRADE_TICKERS,
  PAIR_TYPES
} from '../../../config/constants'

import { createOrder, removeMyOrders } from '../../core/orders'


const debug = (...args) => console.log(new Date().toISOString(), ...args) //_debug('swap.bot')
const n = (n) => (cb) => Array(n).fill(null).map((el, i) => cb(i, el))
const TEN = BigNumber(10)

const getCurrenciesBalance = (balances, ticker) => {
  const [ pair_main, pair_base ] = ticker.split('-')

  const sell = balances[pair_main]
  const buy = balances[pair_base]

  if (sell === 0 && buy === 0) {
    return null
  }

  return { sell, buy }
}

const getAmount = (tickerOrder) => tickerOrder.amount
  ? BigNumber(tickerOrder.amount)
  : BigNumber(TRADE_ORDER_MINAMOUNTS.default).times(TEN.pow(index))

const checkCanCreateCurrentOrder = (tickerOrder, orderType) =>
  typeof(tickerOrder[orderType]) === 'undefined'
    ? true
    : tickerOrder[orderType]

const checkHaveSpread = (tickerOrder, orderType) =>
  tickerOrder[`spread${orderType === 'buy' ? 'Buy' : 'Sell'}`] > 0
    ? true
    : false

const getSpread = (tickerOrder, orderType) => orderType === 'buy'
  ? BigNumber(100)
    .minus(tickerOrder.spreadBuy)
    .dividedBy(100)
  : BigNumber(100)
    .plus(tickerOrder.spreadSell)
    .dividedBy(100)

const createOrders = (orderType, balance, ticker, tickerOrders, basePrice) => {
  const orders = []
  const type = orderType === 'buy' ? PAIR_TYPES.BID : PAIR_TYPES.ASK
  const canCreateOrders = TRADE_CONFIG[ticker][orderType] && balance > 0
  const checkIsEnoughBalance = (price, amount) => orderType === 'buy'
    ? BigNumber(balance).isLessThan(amount)
    : BigNumber(balance).isLessThan(BigNumber(amount).dividedBy(price))

  debug(ticker, `create ${orderType} orders`, canCreateOrders)

  if (canCreateOrders) {
    tickerOrders.forEach((tickerOrder, index) => {
      const canCreateCurrentOrder = checkCanCreateCurrentOrder(tickerOrder, orderType)
      const haveSpread = checkHaveSpread(tickerOrder, orderType)

      if (!canCreateCurrentOrder || !haveSpread) {
        return
      }

      const spread = getSpread(tickerOrder, orderType)
      const price = basePrice.multipliedBy(spread)
      const amount = getAmount(tickerOrder)
      const isEnoughBalance = checkIsEnoughBalance(price, amount)

      if (isEnoughBalance) {
        return
      }

      orders.push(new Pair({ ticker, price, type, amount }))
    })
  }

  return orders
}

const createAllOrders = async (balances, ticker) => {
  const price = TRADE_CONFIG[ticker].sellPrice
    ? BigNumber(TRADE_CONFIG[ticker].sellPrice)
    : await fetchPrice(ticker,  TRADE_CONFIG[ticker].type)

  if (!price) {
    throw new Error(`${ticker} price is empty`)
  }

  const tickerOrders = TRADE_CONFIG[ticker].orders

  if (!tickerOrders || tickerOrders.length === 0) {
    throw new Error(`${ticker} orders is empty`)
  }

  const currenciesBalance = getCurrenciesBalance(balances, ticker)

  if (!currenciesBalance) {
    throw new Error(`${ticker} wallets are empty`)
  }

  return [
    ...createOrders('buy', currenciesBalance.buy, ticker, tickerOrders, price),
    ...createOrders('sell', currenciesBalance.sell, ticker, tickerOrders, price)
  ]
}

const fillOrders = async (balances, ticker, create) => {
  try {
    debug('fillOrders for', ticker)

    const orders = await createAllOrders(balances, ticker)

    debug('new orders', orders.length)

    orders
      .map(pair => ({ ...pair.toOrder(), isPartial: true }))
      .map(create)
      .map(order => order.setRequestHandlerForPartial('buyAmount',
        ({ buyAmount }, oldOrder) => {
          const oldPair = Pair.fromOrder(oldOrder)

          debug('oldPair', oldPair)

          const { price } = oldPair

          debug('newBuyAmount', buyAmount.toString())

          // BUY [main] = SELL [base] CURRENCY
          // price = [main]/[base] = [buy]/[sell]

          // BUY 10 ETH = SELL 1 BTC
          // price = 10 = buyAmount / sellAmount
          // newSellAmount = buyAmount / price

          const sellAmount = oldPair.isBid()
            ? buyAmount.times(price)
            : buyAmount.div(price)

          debug('newSellAmount', sellAmount.toString())

          const newOrder = ({ sellAmount, buyAmount })

          debug('newOrder', newOrder, newOrder.buyAmount.toString(), newOrder.sellAmount.toString())

          return Pair.fromOrder({ ...oldOrder, ...newOrder }).toOrder()
        }))
      .map(order => order.setRequestHandlerForPartial('sellAmount',
        ({ sellAmount }, oldOrder) => {
          const oldPair = Pair.fromOrder(oldOrder)

          debug('oldPair', oldPair, oldPair.price.toString())

          const { price } = oldPair

          debug('newSellAmount', sellAmount.toString())

          // if BID, then
          // price == buyAmount / sellAmount

          const buyAmount = oldPair.isBid()
            ? sellAmount.div(price)
            : sellAmount.times(price)

          debug('newBuyAmount', buyAmount.toString())

          const newOrder = ({ sellAmount, buyAmount })

          debug('newOrder', newOrder, newOrder.buyAmount.toString(), newOrder.sellAmount.toString())

          return Pair.fromOrder({ ...oldOrder, ...newOrder }).toOrder()
        }))
  } catch (err) {
    handleError(err)
  }
}

export default async (wallet, orders) => {
  removeMyOrders(orders)

  const symbols = Object.keys(TRADE_CONFIG)
    .filter((item) => TRADE_CONFIG[item].active)
    .map(ticker => ticker.split('-'))
    .reduce((sum, arr) => sum.concat(arr), [])
    .sort((a, b) => a > b ? 1 : a == b ? 0 : -1)

  const balances = await wallet.getBalance(symbols)

  const balanceForSymbol = balances
    .reduce((obj, elem) => ({
      ...obj,
      [elem.symbol]: elem.value,
    }), {})

  debug('balances', balanceForSymbol)

  return Object.keys(TRADE_CONFIG)
    .filter((item) => TRADE_CONFIG[item].active)
    .map(ticker => fillOrders(balanceForSymbol, ticker, createOrder(orders)))
}
