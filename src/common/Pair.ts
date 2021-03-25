import BigNumber from 'bignumber.js'

// bot imports

import {
  TOKEN_DECIMALS as BOT_DECIMALS_module,
  TRADE_TICKERS as BOT_TRADE_TICKERS_module,
} from 'bot/config/constants'

const BOT_DECIMALS = BOT_DECIMALS_module.default

import * as configStorage from 'bot/config/storage'

const BOT_TRADE_TICKERS = configStorage.hasTradeConfig()
  ? configStorage.getTradeTickers()
  : BOT_TRADE_TICKERS_module.default


// core imports

import CORE_TRADE_TICKERS from 'swap.app/constants/TRADE_TICKERS'
import { COIN_DATA as CORE_COIN_DATA } from 'swap.app/constants/COINS'

const CORE_DECIMALS = Object.entries(CORE_COIN_DATA)
  .filter(([ticker, coinData]) => {
    return typeof coinData.precision === 'number'
  }).map(([ticker, coinData]) => ({ [coinData.ticker]: coinData.precision})).reduce((acc, record) => {
    return { ...acc, ...record }
  }, {})


// front imports

import FRONT_DECIMALS_RAW from 'helpers/constants/TOKEN_DECIMALS'
import FRONT_TRADE_TICKERS from 'helpers/constants/TRADE_TICKERS'

const FRONT_DECIMALS = Object.entries(FRONT_DECIMALS_RAW)
  .reduce((acc, [ticker, decimals]) => {
    return {
      ...acc,
      [ticker.toUpperCase()]: decimals,
    }
  }, {})



const TRADE_TICKERS = [
  ...BOT_TRADE_TICKERS,
  ...CORE_TRADE_TICKERS,
  ...FRONT_TRADE_TICKERS,
]

const DECIMALS = {
  ...BOT_DECIMALS,
  ...CORE_DECIMALS,
  ...FRONT_DECIMALS,
}


export const PAIR_TYPES = Object.freeze({
  BID: 'bid',
  ASK: 'ask',
})

const PAIR_BID = PAIR_TYPES.BID
const PAIR_ASK = PAIR_TYPES.ASK

const isAsk = (type) => (type === PAIR_TYPES.ASK)
const isBid = (type) => (type === PAIR_TYPES.BID)

const filteredDecimals = ({ amount, currency }) => {
  const precision = DECIMALS[currency.toUpperCase()] || DECIMALS.default || 18
  return new BigNumber(amount).decimalPlaces(precision).toString()
}

export const parseTicker = (order) => {
  const { buyCurrency: buy, sellCurrency: sell } = order

  const BS = `${buy}-${sell}`.toUpperCase() // buys ETH, sells BTC, BID
  const SB = `${sell}-${buy}`.toUpperCase() // sells ETH = ASK

  if (TRADE_TICKERS.includes(BS)) {
    return {
      ticker: BS,
      type: PAIR_BID,
    }
  }

  if (TRADE_TICKERS.includes(SB)) {
    return {
      ticker: SB,
      type: PAIR_ASK,
    }
  }

  throw new Error(`ParseTickerError: No such tickers: ${BS},${SB}`)
}

export const parsePair = (str) => {

  if (!str) {
    throw new Error(`Empty string: ${str}`)
  }

  if (typeof str !== 'string') {
    throw new Error(`ParseTickerError: Not a string: ${str}`)
  }

  const tokens = str.split('-')

  if (tokens.length !== 2) {
    throw new Error(`ParseTickerError: Wrong tokens: ${str}`)
  }

  if (!TRADE_TICKERS.includes(str)) {
    str = tokens.reverse().join('-')
  }

  if (!TRADE_TICKERS.includes(str)) {
    throw new Error(`ParseTickerError: Ticker not found: ${str}`)
  }

  const MAIN = tokens[0].toUpperCase()
  const BASE = tokens[1].toUpperCase()

  return {
    MAIN,
    BASE,
  }
}

export default class Pair {
  price: BigNumber
  amount: BigNumber
  ticker: string
  main: string
  base: string
  type: string
  total: BigNumber

  constructor({ price, amount, ticker, type }) {
    this.price = new BigNumber(price)
    this.amount = new BigNumber(amount)

    const { MAIN, BASE } = parsePair(ticker)
    if (!MAIN || !BASE) throw new Error(`CreateOrderError: No currency: ${MAIN}-${BASE}`)

    this.ticker = ticker
    this.main = MAIN
    this.base = BASE
    this.type = type === PAIR_TYPES.BID ? PAIR_TYPES.BID : PAIR_TYPES.ASK
    this.total = this.price.times(this.amount)
  }

  /*
  * 10 ETH -> 1 BTC
  *
  * ticker: ETH-BTC
  *
  * So we are on ETH market, thus:
  *   - ASK orders are SELL ETH (for BTC),
  *   - BID orders are BUY ETH (for BTC)
  *
  * This order is SELLING ETH, to it's ASK
  * type: BID = true, ASK = false
  *
  * Price is also calculated in BTC, while amount in ETH
  * price: 0.1
  * amount: 10
  *
  *
  * So, for type = ASK
  *
  * buyCurrency: BTC = base
  * sellCurrency: ETH = main
  * buyAmount: 1 BTC = (0.1 BTC/ETH) * 10 ETH = price * amount
  * sellAmount: 10 ETH = 10 ETH = amount
  *
  */
  toOrder() {
    const { ticker, type, price, amount } = this

    console.log(`create order ${this}`)
    const { MAIN, BASE } = parsePair(ticker)
    if (!MAIN || !BASE) throw new Error(`CreateOrderError: No currency: ${MAIN}-${BASE}`)

    if (![PAIR_ASK, PAIR_BID].includes(type)) throw new Error(`CreateOrderError: Wrong order type: ${type}`)

    const base = { currency: BASE, amount: amount }
    const main = { currency: MAIN, amount: amount.div(price) }

    const buy = (type === PAIR_ASK) ? base : main
    const sell = (type === PAIR_ASK) ? main : base

    return {
      buyCurrency: buy.currency,
      sellCurrency: sell.currency,
      buyAmount: filteredDecimals(buy),
      sellAmount: filteredDecimals(sell),
      exchangeRate: price, // isAsk(type) ? price : 1/price
    }
  }

  static fromOrder(order) {
    const { buyAmount, sellAmount } = order
    const { ticker, type } = parseTicker(order)

    if (ticker === 'none') {
      return
    }

    // ASK means sellCurrency is ETH, then sell is main
    const mainAmount = new BigNumber(type === PAIR_ASK ? sellAmount : buyAmount)
    const baseAmount = new BigNumber(type === PAIR_ASK ? buyAmount : sellAmount)

    return new Pair({
      ticker,
      type,
      price: baseAmount.div(mainAmount),
      amount: baseAmount,
    })
  }

  toString() {
    const type = this.type === PAIR_TYPES.BID ? 'bid' : 'ask'
    return `${type} \t${this.ticker} \t${this.price.dp(8)} \t${this.amount}`
  }

  static check(order, ticker) {
    try {
      const pair = Pair.fromOrder(order)
      const { MAIN, BASE } = parsePair(ticker.toUpperCase())

      return pair.ticker === `${MAIN}-${BASE}`
    } catch (err) {
      return false
    }
  }

  static compareOrders(order1, order2) {
    const pair1 = Pair.fromOrder(order1)
    const pair2 = Pair.fromOrder(order2)

    return pair1.price.comparedTo(pair2.price)
  }

  isBid() {
    return isBid(this.type)
  }

  isAsk() {
    return isAsk(this.type)
  }
}
