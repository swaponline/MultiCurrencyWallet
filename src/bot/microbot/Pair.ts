import BigNumber from 'bignumber.js'

import {
  TOKEN_DECIMALS,
  TRADE_TICKERS as DEFAULT_TRADE_TICKERS,
  PAIR_TYPES
} from '../config/constants'
import * as configStorage from '../config/storage'


const TRADE_TICKERS = configStorage.hasTradeConfig()
  ? configStorage.getTradeTickers()
  : DEFAULT_TRADE_TICKERS

const PAIR_BID = PAIR_TYPES.BID
const PAIR_ASK = PAIR_TYPES.ASK

const isAsk = (type) => (type === PAIR_TYPES.ASK)
const isBid = (type) => (type === PAIR_TYPES.BID)

const filteredDecimals = ({ amount, currency }) =>
  new BigNumber(amount).decimalPlaces(TOKEN_DECIMALS[currency] || TOKEN_DECIMALS.default).toString()

const parseTicker = (order) => {
  const { buyCurrency: buy, sellCurrency: sell } = order

  const BS = `${buy}-${sell}`.toUpperCase() // buys ETH, sells BTC, BID
  const SB = `${sell}-${buy}`.toUpperCase() // sells ETH = ASK

  if (TRADE_TICKERS.includes(BS)) return { ticker: BS, type: PAIR_BID }
  if (TRADE_TICKERS.includes(SB)) return { ticker: SB, type: PAIR_ASK }

  throw new Error(`ParseTickerError: No such tickers: ${BS},${SB}`)
}
//@ToDo move to outside
const parsePair = (str) => {
  if (!str) throw new Error(`Empty string: ${str}`)
  if (typeof str !== 'string') throw new Error(`ParseTickerError: Not a string: ${str}`)

  const tokens = str.split('-')
  if (tokens.length !== 2) throw new Error(`ParseTickerError: Wrong tokens: ${str}`)

  if (TRADE_TICKERS.includes(str)) {
    str = str
  } else {
    str = tokens.reverse().join('-')
  }

  if (!TRADE_TICKERS.includes(str)) throw new Error(`ParseTickerError: Ticker not found: ${str}`)

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
  type: any

  constructor({ price, amount, ticker, type }) {
    this.price = new BigNumber(price)
    this.amount = new BigNumber(amount)

    const { MAIN, BASE } = parsePair(ticker)
    if (!MAIN || !BASE) throw new Error(`CreateOrderError: No currency: ${MAIN}-${BASE}`)

    this.ticker = ticker
    this.main = MAIN
    this.base = BASE
    this.type = type === PAIR_TYPES.BID ? PAIR_TYPES.BID : PAIR_TYPES.ASK
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

    console.log(new Date().toISOString(), `create order ${this}`)
    const { MAIN, BASE } = parsePair(ticker)
    if (!MAIN || !BASE) throw new Error(`CreateOrderError: No currency: ${MAIN}-${BASE}`)

    if (![PAIR_ASK, PAIR_BID].includes(type)) throw new Error(`CreateOrderError: Wrong order type: ${type}`)

    const base = { currency: BASE, amount: amount }
    const main = { currency: MAIN, amount: amount.div(price) }

    const buy = (type == PAIR_ASK) ? base : main
    const sell = (type == PAIR_ASK) ? main : base

    return {
      buyCurrency: buy.currency,
      sellCurrency: sell.currency,
      buyAmount: filteredDecimals(buy),
      sellAmount: filteredDecimals(sell),
      exchangeRate: price, // isAsk(type) ? price : 1/price
    }
  }

  static fromOrder(order) {
    const { buyCurrency: buy, sellCurrency: sell, buyAmount, sellAmount } = order

    const { ticker, type } = parseTicker(order)

    // ASK means sellCurrency is ETH, then sell is main
    const main_amount = new BigNumber(type == PAIR_ASK ? sellAmount : buyAmount)
    const base_amount = new BigNumber(type == PAIR_ASK ? buyAmount : sellAmount)

    return new Pair({
      ticker,
      type,
      price: base_amount.div(main_amount),
      amount: base_amount,
    })
  }

  toString() {
    const type = this.type === PAIR_TYPES.BID ? 'bid' : 'ask'
    return `${type} \t${this.ticker} \t${this.price.dp(8)} \t${this.amount}`
  }

  isBid() {
    return isBid(this.type)
  }

  isAsk() {
    return isAsk(this.type)
  }
}
