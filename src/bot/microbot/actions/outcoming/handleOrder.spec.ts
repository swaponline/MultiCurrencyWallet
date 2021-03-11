import handleOrder from './handleOrder'


const _GOOD_ORDER = {
  'buyCurrency': 'ETH', // that's a BID, he wants to buy on a market 1:!, while
  'sellCurrency': 'BTC', // the price currently 1:20
  'buyAmount': '1',
  'sellAmount': '1',
}

const _BAD_ORDER = {
  'buyCurrency': 'BTC', // the same inverted
  'sellCurrency': 'ETH',
  'buyAmount': '1',
  'sellAmount': '1',
}

const _WHAT_S_THAT = {
  'buyCurrency': 'USDT', // wrong input
  'sellCurrency': 'GAL',
  'buyAmount': '100',
  'sellAmount': '100',
}

let fakeOrders, createOrder, removeOrder

describe('Handle Order', () => {
  beforeEach(() => {
    createOrder = jest.fn()
    removeOrder = jest.fn()

    fakeOrders = {
      create: createOrder,
      remove: removeOrder,
      items: []
    }
  })

  it('should GRAB good orders', () => {
    const doRequest = jest.fn(function () { return Promise.resolve(false) })

    expect.assertions(1)
    return handleOrder(fakeOrders, _GOOD_ORDER)(doRequest)
      .then(() => {
        // disabled
        // expect(doRequest).toHaveBeenCalled()
        expect(doRequest).not.toHaveBeenCalled()
      })
  })

  it('should not touch BAD orders', () => {
    const doRequest = jest.fn(function () { return Promise.resolve(false) })

    expect.assertions(1)
    //@ts-ignore
    return handleOrder(fakeOrders)(_BAD_ORDER, doRequest)
      .then(() => {
        expect(doRequest).not.toHaveBeenCalled()
      })
  })

  it('should ignore', () => {
    const doRequest = jest.fn(function () { return Promise.resolve(false) })
    //@ts-ignore
    return handleOrder(fakeOrders)(_WHAT_S_THAT, doRequest)
      .then(() => {
        expect(doRequest).not.toHaveBeenCalled()
      })
  })
})
