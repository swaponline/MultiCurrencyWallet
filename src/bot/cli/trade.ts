import BigNumber from 'bignumber.js'


const PAIR_BID = true
const PAIR_ASK = false

const isAsk = (type) => (type === PAIR_ASK)
const isBid = (type) => (type === PAIR_BID)

const TRADE_TICKERS = [
  'ETH-BTC',
  'NOXON-BTC',
  'SWAP-BTC',
  'BTRM-BTC',
  'SWAP-USDT',
  // 'NOXON-ETH',
  'XSAT-BTC',
  'HDP-BTC',
]

const DECIMALS = {
  BTC: 8,
  ETH: 18,
  SWAP: 18,
  XSAT: 18,
  HDP: 4,
  NOXON: 0,
  USDT: 8,
}

const filteredDecimals = ({ amount, currency }) =>
  new BigNumber(amount).decimalPlaces( DECIMALS[currency] || 0 ).toString()

const parseTicker = (order) => {
  const { buyCurrency: buy, sellCurrency: sell } = order

  const BS = `${buy}-${sell}`.toUpperCase() // buys ETH, sells BTC, BID
  const SB = `${sell}-${buy}`.toUpperCase() // sells ETH = ASK

  if ( TRADE_TICKERS.includes(BS) ) return { ticker: BS, type: PAIR_BID }
  if ( TRADE_TICKERS.includes(SB) ) return { ticker: SB, type: PAIR_ASK }

  throw new Error(`ParseTickerError: No such tickers: ${BS},${SB}`)
}

const parsePair = (str) => {
  if (!str) throw new Error(`Empty string: ${str}`)
  if (typeof str != 'string') throw new Error(`ParseTickerError: Not a string: ${str}`)

  const tokens = str.split('-')
  if (tokens.length !== 2) throw new Error(`ParseTickerError: Wrong tokens: ${str}`)

  if (TRADE_TICKERS.includes(str))
    str = str
  else
    str = tokens.reverse().join('-')

  if (!TRADE_TICKERS.includes(str)) throw new Error(`ParseTickerError: Ticker not found: ${str}`)

  const MAIN = tokens[0].toUpperCase()
  const BASE = tokens[1].toUpperCase()

  return {
    MAIN,
    BASE,
  }
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
const createOrder = (ticker, type, price, amount) => {
  // console.log('create order', ticker, type, price, amount)
  const { MAIN, BASE } = parsePair(ticker)
  if (!MAIN || !BASE)
    throw new Error(`CreateOrderError: No currency: ${MAIN}-${BASE}`)

  if (![PAIR_ASK, PAIR_BID].includes(type))
    throw new Error(`CreateOrderError: Wrong order type: ${type}`)

  const base = { currency: BASE, amount: price * amount }
  const main = { currency: MAIN, amount: amount }

  const buy   = (type == PAIR_ASK) ? base : main
  const sell  = (type == PAIR_ASK) ? main : base

  return {
    buyCurrency:  buy.currency,
    sellCurrency: sell.currency,
    buyAmount:    filteredDecimals(buy),
    sellAmount:   filteredDecimals(sell),
    exchangeRate: isAsk(type) ? price : 1/price
  }
}

const convertOrder = (order) => {
  const { buyCurrency: buy, sellCurrency: sell, buyAmount, sellAmount } = order

  const { ticker, type } = parseTicker(order)

  // ASK means sellCurrency is ETH, then sell is main
  const main_amount = parseFloat(type == PAIR_ASK ? sellAmount : buyAmount)
  const base_amount = parseFloat(type == PAIR_ASK ? buyAmount  : sellAmount)

  return {
    ticker,
    type,
    price: base_amount / main_amount,
    amount: main_amount,
  }
}

export {
  createOrder,
  parsePair,
  parseTicker,
  convertOrder,
  PAIR_ASK,
  PAIR_BID,
  TRADE_TICKERS,
  DECIMALS,
}
