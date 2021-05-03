import * as swap from '../src'

const {
  room: { ready },
} = swap.helpers

const {
  tokenSwap,
} = swap.config

const { app, room } = swap.setup({
  ERC20TOKENS: [
    {
      name: 'BTRM',
      decimals: 18,
      tokenAddress: '0x14a52cf6B4F68431bd5D9524E4fcD6F41ce4ADe9'
    },
    {
      network: 'mainnet',
      name: 'DAI',
      decimals: 18,
      tokenAddress: '0xDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF'
    },
  ],
})

beforeAll(async () => {
  await ready(room)
})

test('check token added', () => {
  //@ts-ignore: strictNullChecks
  expect(Object.values(app.swaps).length).toBe(5)
  //@ts-ignore: strictNullChecks
  expect(app.swaps.BTRM).not.toBeNull()
  //@ts-ignore: strictNullChecks
  expect(app.swaps.BTRM).not.toBeUndefined()
})

test('check testnet token is not added', () => {
  //@ts-ignore: strictNullChecks
  expect(app.swaps.DAI).toBeUndefined()
})

test('check flows are added', () => {
  //@ts-ignore: strictNullChecks
  expect(Object.keys(app.flows).length).toBe(14)

  // expect(app.flows.USDT2BTRM).not.toBeUndefined()
  // expect(app.flows.BTRM2USDT).not.toBeUndefined()
  //@ts-ignore: strictNullChecks
  expect(app.flows.BTC2BTRM).not.toBeUndefined()
  //@ts-ignore: strictNullChecks
  expect(app.flows.BTRM2BTC).not.toBeUndefined()
})
