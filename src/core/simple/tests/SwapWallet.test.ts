import * as swap from '../src'

const {
  on: { onFinish },
  room: { ready },
  orders: { request, subscribe },
  swap: { onStep, start },
} = swap.helpers

const { room, wallet } = swap.setup({})

beforeAll(done => {
  ready(room).then(done)
})

test('wallet exists', () => {
  expect(wallet).not.toBeNull()
})

test('wallet can query balance', async () => {
  const { symbol, value } = await wallet.getBalanceBySymbol('BTC')

  expect(symbol).toBe('BTC')
  expect(value).toBe(0)
})

test('wallet can return crypto data', async () => {
  const data = await wallet.getData()

  expect(data.length).not.toBe(0)
})
