import app from './setupSwapApp'
import rimraf from 'rimraf'

jest.unmock('swap.app')
jest.setTimeout(30000)

//@ts-ignore: strictNullChecks
const orders = app.services.orders

const _ORDER = {
  sellCurrency: 'BTC',
  sellAmount: 1,
  buyCurrency: 'ETH',
  buyAmount: 20,
}

beforeAll(() => orders.getMyOrders().map(({ id }) => orders.remove(id)))

afterAll(done => rimraf('.storage', done))

test('check app loaded', () => {
  //@ts-ignore: strictNullChecks
  expect(app.isTestNet()).toBe(true)
  //@ts-ignore: strictNullChecks
  expect(app.isMainNet()).toBe(false)
})

test('sets the right type of room', () => {
  //@ts-ignore: strictNullChecks
  expect(app.services.room.roomName).toBe('swap.core.tests.swap.online')
})

test('create an order', async () => {
  orders.remove()
  orders.create(_ORDER)

  const myOrders = orders.items
    .filter(({ isMy }) => isMy)
    .map(({ buyCurrency, sellCurrency, buyAmount, sellAmount }) => ({ buyCurrency, sellCurrency, buyAmount, sellAmount }))

  expect(myOrders.length).toEqual(1)

  const { buyCurrency, sellCurrency, buyAmount, sellAmount } = myOrders[0]

  expect(buyCurrency).toEqual(_ORDER.buyCurrency)
  expect(buyAmount.comparedTo(_ORDER.buyAmount)).toEqual(0)
})
