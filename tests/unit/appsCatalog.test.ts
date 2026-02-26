import {
  defaultWalletAppId,
  getWalletAppById,
  isAllowedWalletAppUrl,
  resolveWalletAppUrl,
} from 'pages/Apps/appsCatalog'

describe('Wallet Apps Catalog', () => {
  it('uses onout-dex as default app for first approximation', () => {
    expect(defaultWalletAppId).toBe('onout-dex')
  })

  it('resolves internal app route into host hash url', () => {
    const exchangeApp = getWalletAppById('swapio-exchange')

    expect(exchangeApp).toBeDefined()

    const resolvedUrl = resolveWalletAppUrl(exchangeApp!)

    expect(resolvedUrl).toBe(`${window.location.origin}${window.location.pathname}#/exchange/quick`)
    expect(isAllowedWalletAppUrl(resolvedUrl)).toBe(true)
  })

  it('allows only configured external hosts in allowlist', () => {
    expect(isAllowedWalletAppUrl('https://dex.onout.org/')).toBe(true)
    expect(isAllowedWalletAppUrl('https://app.uniswap.org/#/swap')).toBe(true)
    expect(isAllowedWalletAppUrl('https://evil.example.com/')).toBe(false)
  })
})
