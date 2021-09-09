//@ts-nockeck
import BigNumber from 'bignumber.js'

import TOKEN_DECIMALS from 'helpers/constants/TOKEN_DECIMALS'
import TRADE_TICKERS from 'helpers/constants/TRADE_TICKERS'
import PAIR_TYPES from 'helpers/constants/PAIR_TYPES'
import config from 'app-config'


const isWidgetBuild = config && config.isWidget

console.log('TRADE_TICKERS', TRADE_TICKERS)

const PAIR_BID = PAIR_TYPES.BID
const PAIR_ASK = PAIR_TYPES.ASK

const isAsk = (type) => (type === PAIR_TYPES.ASK)
const isBid = (type) => (type === PAIR_TYPES.BID)

const filteredDecimals = ({ amount, currency }) =>
  new BigNumber(amount).decimalPlaces(TOKEN_DECIMALS[currency] || 0).toString()

export const parseTicker = (order) => {
  const {
    buyCurrency,
    sellCurrency,
  } = order

  const buy = buyCurrency
  const sell = sellCurrency
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

  if (!isWidgetBuild) {
    console.warn(`ParseTickerError: No such tickers: ${BS},${SB}`)
  }

  return { ticker: 'none', type: PAIR_BID }
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
  price: any
  amount: any
  ticker: any
  main: any
  base: any
  type: any
  total: any

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

    const { MAIN, BASE } = parsePair(ticker)
    //@ts-ignore
    if (!MAIN || !BASE) throw new Error(`CreateOrderError: No currency: ${main}-${base}`)

    if (![PAIR_ASK, PAIR_BID].includes(type)) throw new Error(`CreateOrderError: Wrong order type: ${type}`)

    const base = { currency: BASE, amount: amount.times(price) }
    const main = { currency: MAIN, amount }

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
    const { buyCurrency, sellCurrency, buyAmount, sellAmount } = order
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
      amount: mainAmount,
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

      //@ts-ignore: strictNullChecks
      return pair.ticker === `${MAIN}-${BASE}`
    } catch (err) {
      return false
    }
  }

  static compareOrders(order1, order2) {
    const pair1 = Pair.fromOrder(order1)
    const pair2 = Pair.fromOrder(order2)
    //@ts-ignore: strictNullChecks
    return pair1.price.comparedTo(pair2.price)
  }

  isBid() {
    return isBid(this.type)
  }

  isAsk() {
    return isAsk(this.type)
  }
}
