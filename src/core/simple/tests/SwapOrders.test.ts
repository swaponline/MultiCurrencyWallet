import * as swap from '../src'

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
  //@ts-ignore: strictNullChecks
  expect(orders.items.length).toBe(0)
})

test('check order creation', () => {
  //@ts-ignore: strictNullChecks
  orders.create(_ORDER)

  //@ts-ignore: strictNullChecks
  expect(orders.items.length).toBe(1)
})
