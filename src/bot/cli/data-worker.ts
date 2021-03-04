import asciichart from 'asciichart'

import { convertOrder, TRADE_TICKERS, PAIR_ASK, PAIR_BID } from './trade'
import { print } from './helpers/text'


class DataWorker {

  provider: any
  orders: any

  constructor(orderProvider) {
    this.provider = orderProvider
    this.orders = []
  }

  setOrders(orders) {
    this.orders = orders
    return orders
  }

  async getBAList(payload) {
    const { ticker: raw_ticker } = payload

    const ticker = raw_ticker.toUpperCase()

    if ( !TRADE_TICKERS.includes(ticker) )
      throw new Error(`PlotOrdersError: No ticker: ${ticker}`)

    // const orders = this.orders
    const orders = await this.provider.getOrders()

    const filtered = orders
      .map( o => convertOrder(o) )
      .filter( o => o.ticker == ticker )

    const sorted = filtered
      .sort( (o1, o2) => o1.price - o2.price )

    return sorted
  }

  async plotOrderBook(payload) {
    const sorted = await this.getBAList(payload)

    return this.plotPrices(sorted)
  }

  async plotBids(payload) {
    const sorted = await this.getBAList(payload)

    const bids = sorted.filter( o => o.type == PAIR_BID )

    return this.plotPrices(bids)
  }

  async plotAsks(payload) {
    const sorted = await this.getBAList(payload)

    const asks = sorted.filter( o => o.type == PAIR_ASK )

    return this.plotPrices(asks)
  }

  async plotPrices(sorted) {
    if (sorted.length == 0) return ""

    const lowest_price = sorted.slice(0,1).pop().price * 0.9
    const highest_price = sorted.slice(-1).pop().price * 1.1

    const breakPrice = (price) =>
      Math.floor(79 * (price - lowest_price) / (highest_price - lowest_price))

    const series = sorted
      .reduce( (acc, elem) => {
        const index = breakPrice(elem.price)
        acc[ index ] += elem.amount
        return acc
      }, Array(80).fill(0))

    return asciichart.plot(series, { height: 30 })
  }

  async printOrderBook(payload) {
    const sorted = await this.getBAList(payload)

    return print(sorted)
  }

}

export default DataWorker
