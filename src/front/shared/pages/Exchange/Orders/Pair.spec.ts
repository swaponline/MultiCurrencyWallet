import Pair from './Pair'

import PAIR_TYPES from 'helpers/constants/PAIR_TYPES'

const _ORDER = {
  'buyCurrency': 'ETH',
  'sellCurrency': 'BTC',
  'buyAmount': '2.6666666666666665',
  'sellAmount': '0.18666733', // bitcoin only has 8 decimals
  // 'exchangeRate': '0.07000024875000000438'
}

const _PAIR = {
  type: PAIR_TYPES.BID,
  ticker: 'ETH-BTC',
  price: '0.07000024875000000438',
  amount: '2.6666666666666665',
  total: '0.18666733000000000001329187499999927',
  main: 'ETH',
  base: 'BTC',
}

//@ts-ignore
describe('Trade Pair', () => {
  //@ts-ignore
  it('should create itself from order', () => {
    const pair = Pair.fromOrder(_ORDER)
    //@ts-ignore
    expect(JSON.parse(JSON.stringify(pair))).toEqual(_PAIR)
  })
  //@ts-ignore
  it('should convert pair back to order', () => {
    const pair = new Pair(_PAIR)
    const { exchangeRate, ...order } = pair.toOrder()
    //@ts-ignore
    expect(order).toEqual(_ORDER)
    //@ts-ignore
    expect(
      exchangeRate.times(_ORDER.buyAmount).precision(8)
        .minus(_ORDER.sellAmount)
        .isEqualTo(0)
    ).toBeTruthy()
  })
  //@ts-ignore
  it('should convert pair to nice string', () => {
    const bid = new Pair(_PAIR)
    const ask = new Pair({ ...bid, type: PAIR_TYPES.ASK })

    const bid_str = '' + bid
    const ask_str = '' + ask
    //@ts-ignore
    expect(bid_str.replace('bid', 'ask')).toEqual(ask_str)
  })
  //@ts-ignore
  it('should not lie if its bid or ask', () => {
    const bid = new Pair(_PAIR)
    const ask = new Pair({ ...bid, type: PAIR_TYPES.ASK })
    //@ts-ignore
    expect(bid.isBid()).toBe(true)
    //@ts-ignore
    expect(bid.isAsk()).toBe(false)
    //@ts-ignore
    expect(ask.isBid()).toBe(false)
    //@ts-ignore
    expect(ask.isAsk()).toBe(true)
  })
})
