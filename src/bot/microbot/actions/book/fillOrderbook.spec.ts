import fillOrderbook from './fillOrderbook'


const amount = 1 // BTC

let createOrder, removeOrder, fakeOrders

describe('Fill Orderbook Module', () => {
  beforeEach(() => {
    createOrder = jest.fn()
    removeOrder = jest.fn()

    fakeOrders = {
      create: createOrder,
      remove: removeOrder,
      items: []
    }
  })

  it('should take user input', async () => {
    await fillOrderbook(amount, fakeOrders)

    expect(removeOrder).not.toHaveBeenCalled()
    expect(createOrder).toHaveBeenCalled()
  })

  it('should create many orders', async () => {
    await fillOrderbook(amount, fakeOrders)

    expect(createOrder).toHaveBeenCalled()
    expect(createOrder.mock.calls.length).toBe(16)
  })
})
