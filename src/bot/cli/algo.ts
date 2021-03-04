import BigNumber from 'bignumber.js'
import request from 'request-promise-native'

import {
  createOrder,
  convertOrder,
  PAIR_ASK,
  PAIR_BID,
  TRADE_TICKERS,
} from './trade'


const BTC_SYMBOL = 1 // BTC
const ETH_SYMBOL = 1027 // ETH is 1027
const JOT_SYMBOL = 2948 // Jury.Online
const COIN_API = `https://api.coinmarketcap.com/v2`
const YOBIT_API = `https://yobit.net/api/3`

const getYobitPrice = (symbol, base = 'BTC') => {
  const ticker = `${symbol.toLowerCase()}_${base.toLowerCase()}`

  return request(`${YOBIT_API}/ticker/${ticker}`)
    .then(res => JSON.parse(res))
    .then(json => json[ticker].last)
    .then(num => new BigNumber(num))
    .catch(error => { throw new Error(`Cannot get ${symbol} price: ${error}`) })
}

const getPrice = (symbol, base = 'BTC') =>
  request(`${COIN_API}/ticker/${symbol}/?convert=${base}`)
    .then(res => JSON.parse(res))
    .then(json => json.data.quotes[base].price)
    .then(num => new BigNumber(num))
    .catch(error => { throw new Error(`Cannot get ${symbol} price: ${error}`) })


class AlgoTrade {

  prices: any

  constructor() {
    this.syncPrices()
  }

  async syncPrices() {
    const btcPrice = () => getPrice(BTC_SYMBOL, 'USD')
    const usdPrice = () => btcPrice().then(usds => new BigNumber(1).div(usds))

    const prices = {
      'ETH-BTC':    await getPrice(ETH_SYMBOL),
      'JOT-BTC':    await getPrice(JOT_SYMBOL),
      'USD-BTC':    await usdPrice(),
      'SWAP-BTC':   await usdPrice().then(price => price.multipliedBy('1.01')),
      'SWAP-USDT':  '1.01',
      'NOXON-BTC':  await getPrice(ETH_SYMBOL),
      'NOXON-USDT': '42.3256',
      'BTRM-BTC':   await getYobitPrice('BTRM'),
      'XSAT-BTC':   await usdPrice().then(price => price.multipliedBy('0.13')),
    }

    console.log(`Fetched new prices:`, prices)
    this.prices = prices

    return prices
  }

  getCurrentPrice({ ticker = '' }) {
    const price = this.prices[ticker]

    console.log(`${ticker}: ${price}`)

    if (!price) throw new Error(`Price is not available: ${ticker} = ${price}`)

    return price
  }

  priceFits(order) {
    const { type, ticker, price, amount } = convertOrder(order)
    const minPrice = this.getCurrentPrice({ ticker })

    console.log(`Has a price of ${price}`)
    const TEN = new BigNumber(10)
    // 2 gwei * 100000 gasLimit * 2 two tx = 4e5 * 1e-9 = 4e-4
    const mainFees = new BigNumber(4).times( TEN.pow(-4) )
    // 0.15 mBTC = 1.5e-1 * 1e-3 = 15e-5
    const baseFees = new BigNumber(15).times( TEN.pow(-5) )
    // eth * (BTC/ETH) + btc
    const fees = mainFees.times(price).plus(baseFees)


    const max_ask_price = minPrice.times(amount).plus(fees).div(amount)
    const min_bid_price = minPrice.times(amount).minus(fees).div(amount)

    console.log(`I will buy ${ticker} below ${max_ask_price} or sell above ${min_bid_price}`)

    return (type == PAIR_BID)
      ? new BigNumber(price).isGreaterThan(min_bid_price)
      : new BigNumber(price).isLessThan(max_ask_price)
  }

  fillAllOrders({ total }) {
    const numTickers = TRADE_TICKERS.length
    total = total // numTickers

    return TRADE_TICKERS.reduce((acc, ticker) => {
      const price = this.getCurrentPrice({ ticker })
      const orders = this.fillOrders({ ticker, price, total })
      return [ ...acc, ...orders ]
    }, [])
  }

  fillOrders({ ticker, price, total }) {
    if (!TRADE_TICKERS.includes(ticker.toUpperCase()))
      throw new Error(`FillOrdersError: Wrong ticker: ${ticker}`)

    const _price = new BigNumber(price)
    if (_price.isZero())
      throw new Error(`FillOrdersError: Bad price: ${price}`)

    // console.log('price', price_num)

    const total_amount = new BigNumber(total)
    if (total_amount.isZero())
      throw new Error(`FillOrdersError: Bad total amount: ${total}`)

    // total_amount in BASE (BTC)
    // amount in MAIN (ETH)

    const amount = total_amount.div(_price)

    // price is 0.1 BTC per ETH = BTC/ETH
    // baseFees is BTC, mainFees is ETH
    // so fees in BTC are

    const TEN = new BigNumber(10)
    // 2 gwei * 100000 gasLimit * 2 two tx = 4e5 * 1e-9 = 4e-4
    const mainFees = new BigNumber(4).times( TEN.pow(-4) )
    // 0.15 mBTC = 1.5e-1 * 1e-3 = 15e-5
    const baseFees = new BigNumber(15).times( TEN.pow(-5) )
    // eth * (BTC/ETH) + btc
    const fees = mainFees.times(_price).plus(baseFees)

    // and price changed accordingly
    // TOTAL AMOUNT IN BASE +- FEES / AMOUNT IN MAIN

    const bid_price = _price.times(amount).minus(fees).div(amount).toNumber()
    const ask_price = _price.times(amount).plus(fees).div(amount).toNumber()

    if ((baseFees).gte(_price.times(amount)))
      throw new Error(`Order is too small BASE: ${baseFees} > ${_price.times(amount)} `)

    if ((mainFees).gte((amount)))
      throw new Error(`Order is too small MAIN: ${mainFees} > ${amount}`)

    // BID = BUY ETH below given price
    // ASK = SELL ETH above given price
    const orders = [
      ...Array(4).fill(null).map((e, index) =>
          createOrder(ticker, PAIR_BID, bid_price, amount.times(index + 1))),
      ...Array(4).fill(null).map((e, index) =>
          createOrder(ticker, PAIR_ASK, ask_price, amount.times(index + 1))),
    ]

    return orders
  }
}

export default AlgoTrade
