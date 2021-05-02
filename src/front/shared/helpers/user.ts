import config from 'app-config'

export const getActivatedCurrencies = () => {
  const currencies = []
  if (!config.opts.curEnabled || config.opts.curEnabled.btc) {
    //@ts-ignore: strictNullChecks
    currencies.push('BTC')
    //@ts-ignore: strictNullChecks
    currencies.push('BTC (SMS-Protected)')
    //@ts-ignore: strictNullChecks
    currencies.push('BTC (PIN-Protected)')
    //@ts-ignore: strictNullChecks
    currencies.push('BTC (Multisig)')
  }
  //@ts-ignore: strictNullChecks
  if (!config.opts.curEnabled || config.opts.curEnabled.eth) currencies.push('ETH')

  //@ts-ignore: strictNullChecks
  if (!config.opts.curEnabled || config.opts.curEnabled.ghost) currencies.push('GHOST')

  //@ts-ignore: strictNullChecks
  if (!config.opts.curEnabled || config.opts.curEnabled.next) currencies.push('NEXT')

  Object.keys(config.erc20).forEach((token) => {
    //@ts-ignore: strictNullChecks
    currencies.push(token.toUpperCase())
  })

  return currencies
}
