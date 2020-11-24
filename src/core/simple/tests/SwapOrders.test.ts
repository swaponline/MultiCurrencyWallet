import swap from '../src'

const {
  on: { onFinish },
  room: { ready },
  orders: { request, subscribe },
  swap: { onStep, start },
} = swap.helpers

const _ORDER = {
  buyCurrency: 'ETH',
  sellCurrency: 'BTC',
  buyAmount: 20,
  sellAmount: "1",
}

const { app, wallet, auth, room, orders } = swap.setup({
  swapRoom: {
    roomName: 'xxx.swap.online'
  }
})

beforeAll(async () => {
  await ready(room)
})

test('check app loaded', () => {
  expect(orders.items.length).toBe(0)
})

test('check order creation', () => {
  orders.create(_ORDER)

  expect(orders.items.length).toBe(1)
})
