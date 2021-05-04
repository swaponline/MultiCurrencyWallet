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

  if (!config.opts.curEnabled || config.opts.curEnabled.eth) {
    //@ts-ignore: strictNullChecks
    currencies.push('ETH')
  }

  if (!config.opts.curEnabled || config.opts.curEnabled.bnb) {
    //@ts-ignore: strictNullChecks
    currencies.push('BNB')
  }

  if (!config.opts.curEnabled || config.opts.curEnabled.ghost) {
    //@ts-ignore: strictNullChecks
    currencies.push('GHOST')
  }

  if (!config.opts.curEnabled || config.opts.curEnabled.next) {
    //@ts-ignore: strictNullChecks
    currencies.push('NEXT')
  }

  Object.keys(config.erc20).forEach((token) => {
    //@ts-ignore: strictNullChecks
    currencies.push(token.toUpperCase())
  })

  return currencies
}
