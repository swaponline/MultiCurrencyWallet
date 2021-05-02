import config from 'app-config'

export const getActivatedCurrencies = () => {
  const currencies = []
  if (!config.opts.curEnabled || config.opts.curEnabled.btc) {
    currencies.push('BTC')
    currencies.push('BTC (SMS-Protected)')
    currencies.push('BTC (PIN-Protected)')
    currencies.push('BTC (Multisig)')
  }
  if (!config.opts.curEnabled || config.opts.curEnabled.eth) {
    currencies.push((config.binance) ? `BNB` : `ETH`)
  }

  if (!config.opts.curEnabled || config.opts.curEnabled.ghost) currencies.push('GHOST')

  if (!config.opts.curEnabled || config.opts.curEnabled.next) currencies.push('NEXT')

  Object.keys(config.erc20).forEach((token) => {
    currencies.push(token.toUpperCase())
  })

  return currencies
}
