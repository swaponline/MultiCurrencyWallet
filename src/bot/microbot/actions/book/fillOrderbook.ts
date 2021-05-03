import BigNumber from 'bignumber.js'
import _debug from 'debug'

import handleError from '../../../app/actions/errors/handleError'
import fetchPrice from '../../../app/actions/fetchPrice'
import * as configStorage from '../../../config/storage'
import Pair from '../../Pair'
import { FG_COLORS as COLORS, BG_COLORS , colorString } from 'common/utils/colorString'
import { checkSwapsCountLimit } from '../../core/checkSwapsCountLimit'

import {
  TRADE_CONFIG as DEFAULT_TRADE_CONFIG,
  TRADE_ORDER_MINAMOUNTS as DEFAULT_TRADE_ORDER_MINAMOUNTS,
  TRADE_TICKERS as DEFAULT_TRADE_TICKERS,
  PAIR_TYPES
} from '../../../config/constants'

import { createOrder, removeMyOrders } from '../../core/orders'
import Order from 'swap.orders/Order'


const TRADE_ORDER_MINAMOUNTS = (configStorage.hasTradeConfig()) ? configStorage.getMinAmount() : DEFAULT_TRADE_ORDER_MINAMOUNTS
const TRADE_CONFIG = (configStorage.hasTradeConfig()) ? configStorage.getTradePairs() : DEFAULT_TRADE_CONFIG
const TRADE_TICKERS = (configStorage.hasTradeConfig()) ? configStorage.getTradeTickers() : DEFAULT_TRADE_TICKERS


const debug = (...args) => console.log(new Date().toISOString(), ...args) //_debug('swap.bot')

const n = (n) => (cb) => Array(n).fill(null).map((el, i) => cb(i, el))

const getCurrenciesBalance = (balances, ticker) => {
  const [ pair_main, pair_base ] = ticker.split('-')

  const sell = balances[pair_main]
  const buy = balances[pair_base]

  if (sell === 0 && buy === 0) {
    return null
  }

  return { sell, buy }
}


const checkCanCreateCurrentOrder = (tickerOrder, orderType) =>
  typeof(tickerOrder[orderType]) === 'undefined'
    ? true
    : tickerOrder[orderType]

const checkHaveSpread = (tickerOrder, orderType) =>
  tickerOrder[`spread${orderType === 'buy' ? 'Buy' : 'Sell'}`] >= 0
    ? true
    : false

const getSpread = (tickerOrder, orderType) => {
  if (process.env.SPREAD) {
    return new BigNumber(100)
      .minus(process.env.SPREAD)
      .dividedBy(100)
  }
  return orderType === 'buy'
    ? new BigNumber(100)
      .minus(tickerOrder.spreadBuy)
      .dividedBy(100)
    : new BigNumber(100)
      .plus(tickerOrder.spreadSell)
      .dividedBy(100)
}

const createOrders = (orderType, balance, ticker, tickerOrders, basePrice) => {
  const orders = []
  const type = orderType === 'buy' ? PAIR_TYPES.BID : PAIR_TYPES.ASK
  const canCreateOrders = TRADE_CONFIG[ticker][orderType] && balance > 0
  const checkIsEnoughBalance = (price, amount) => orderType === 'buy'
    ? new BigNumber(balance).isLessThan(amount)
    : new BigNumber(balance).isLessThan(new BigNumber(amount).dividedBy(price))

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

      const TEN = new BigNumber(10)
      const amount = tickerOrder.amount
        ? new BigNumber(tickerOrder.amount)
        : new BigNumber(TRADE_ORDER_MINAMOUNTS.default).times(TEN.pow(index))

      const isEnoughBalance = checkIsEnoughBalance(price, amount)

      if (isEnoughBalance) {
        return
      }

      //@ts-ignore: strictNullChecks
      orders.push(new Pair({ ticker, price, type, amount }))
    })
  }

  return orders
}

const createAllOrders = async (balances, ticker) => {
  const price = TRADE_CONFIG[ticker].sellPrice
    ? new BigNumber(TRADE_CONFIG[ticker].sellPrice)
    : await fetchPrice(ticker, TRADE_CONFIG[ticker].type)

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
      //@ts-ignore: strictNullChecks
      .map(pair => ({ ...pair.toOrder(), isPartial: true }))
      .map(create)
      .map((order: Order) => order.setRequestHandlerForPartial('buyAmount',
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
      .map((order: Order) => order.setRequestHandlerForPartial('sellAmount',
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

export default async (wallet, orders): Promise<Promise<void>[]> => {
  console.log(
    colorString(`Prepare order book...`, COLORS.GREEN)
  )

  removeMyOrders(orders)

  // Check paraller swaps limit
  if (!checkSwapsCountLimit()) {
    console.log(
      colorString(`Prepare order book:`, COLORS.GREEN),
      colorString(`Break - Paraller swap limit`, COLORS.RED)
    )
    return []
  }

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

  const filledOrders = Object.keys(TRADE_CONFIG)
    .filter((item) => TRADE_CONFIG[item].active)
    .map(async ticker => await fillOrders(balanceForSymbol, ticker, createOrder(orders)))

  console.log(
    colorString(`Prepare order book:`, COLORS.GREEN),
    colorString(`Ready. Start fill...`, COLORS.RED)
  )

  return filledOrders
}
