import config from 'app-config'
import externalConfig from './externalConfig'
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

  if (!config.opts.curEnabled || config.opts.curEnabled.matic) {
    currencies.push('MATIC')
  }

  if (!config.opts.curEnabled || config.opts.curEnabled.arbeth) {
    currencies.push('ARBETH')
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

      const baseCurrency = TOKEN_STANDARDS[standard].currency.toUpperCase()
      const tokenName = token.toUpperCase()
      const tokenValue = `{${baseCurrency}}${tokenName}`

      currencies.push(tokenValue)
    })
  })

  return currencies
}

export const getWidgetCurrencies = () => {
  const { core: { hiddenCoinsList } } = store.getState()
  const widgetCurrencies = [
    'BTC',
    'ETH',
    'BNB',
    'MATIC',
    'ARBETH',
    'GHOST',
    'NEXT',
  ]

  if (!hiddenCoinsList.includes('BTC (PIN-Protected)')) {
    widgetCurrencies.push('BTC (PIN-Protected)')
  }
  if (!hiddenCoinsList.includes('BTC (Multisig)')) {
    widgetCurrencies.push('BTC (Multisig)')
  }

  if (externalConfig.isWidget) {
    if (window?.widgetEvmLikeTokens?.length) {
      window.widgetEvmLikeTokens.forEach((token) => {

        const baseCurrency = TOKEN_STANDARDS[token.standard].currency.toUpperCase()
        const tokenName = token.name.toUpperCase()
        const tokenValue = `{${baseCurrency}}${tokenName}`

        widgetCurrencies.push(tokenValue)
      })
    } else {
      widgetCurrencies.push(config.erc20token.toUpperCase())
    }
  }

  return widgetCurrencies
}

export const filterUserCurrencyData = (currencyData) =>
  currencyData.filter((wallet) =>
    isAllowedCurrency(wallet.isToken ? wallet.tokenKey.toUpperCase() : wallet.currency, wallet.address)
  )

export const isAllowedCurrency = (currency = '', address = '') => {
  const { core: { hiddenCoinsList } } = store.getState()
  const enabledCurrencies = getActivatedCurrencies()

  return (
    !hiddenCoinsList.includes(currency) &&
    !hiddenCoinsList.includes(`${currency}:${address}`) &&
    enabledCurrencies.includes(currency)
  )
}

export const isCorrectWalletToShow = (wallet) => {
  return !wallet.isMetamask || (wallet.isConnected && !wallet.unknownNetwork)
}
