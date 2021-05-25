import config from 'app-config'
import store from 'redux/store'
import TOKEN_STANDARDS from 'helpers/constants/TOKEN_STANDARDS'

export const getActivatedCurrencies = () => {
  const currencies: string[] = []

  if (!config.opts.curEnabled || config.opts.curEnabled.btc) {
    currencies.push('BTC')
    currencies.push('BTC (SMS-Protected)')
    currencies.push('BTC (PIN-Protected)')
    currencies.push('BTC (Multisig)')
  }

  if (!config.opts.curEnabled || config.opts.curEnabled.eth) {
    currencies.push('ETH')
  }

  if (!config.opts.curEnabled || config.opts.curEnabled.bnb) {
    currencies.push('BNB')
  }

  if (!config.opts.curEnabled || config.opts.curEnabled.ghost) {
    currencies.push('GHOST')
  }

  if (!config.opts.curEnabled || config.opts.curEnabled.next) {
    currencies.push('NEXT')
  }

  Object.keys(TOKEN_STANDARDS).forEach((key) => {
    const standard = TOKEN_STANDARDS[key].standard

    Object.keys(config[standard]).forEach((token) => {
      currencies.push(token.toUpperCase())
    })
  })

  return currencies
}

export const filterUserCurrencyData = (currencyData) => {
  const { core: { hiddenCoinsList } } = store.getState()
  const enabledCurrencies = getActivatedCurrencies()

  function isAllowed(target) {
    const currency = target.currency?.toUpperCase()

    return (
      !hiddenCoinsList.includes(currency) &&
      !hiddenCoinsList.includes(`${currency}:${target.address?.toUpperCase()}`) &&
      enabledCurrencies.includes(currency) &&
      target.balance > 0
    )
  }

  return currencyData.filter((wallet) => {
    return isAllowed(wallet)
  })
}
