import BigNumber from 'bignumber.js'

import fetchPrice from '../../../app/actions/fetchPrice'


describe('Fetch Price', () => {
  it('should fetch price as a bignumber', async () => {
    const price = await fetchPrice('ETH-BTC')

    expect(BigNumber.isBigNumber(price)).toBeTruthy()
    //@ts-ignore: strictNullChecks
    expect(price.isGreaterThan(0.01)).toBeTruthy()
  })

  it('should have SWAP price less than ETHERs', async () => {
    const swapPrice = await fetchPrice('SWAP-BTC')
    const ethPrice = await fetchPrice('ETH-BTC')

    //@ts-ignore: strictNullChecks
    expect(ethPrice.isGreaterThan(swapPrice)).toBeTruthy()
  })

  it('should accept a Pair as input: NOXON-BTC', async () => {
    const pair = { ticker: 'NOXON-BTC' }
    const noxonPrice = await fetchPrice(pair)

    expect(BigNumber.isBigNumber(noxonPrice)).toBeTruthy()
    //@ts-ignore: strictNullChecks
    expect(noxonPrice.isGreaterThan(0)).toBeTruthy()
  })
})
