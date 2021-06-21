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

  if (!config.opts.curEnabled || config.opts.curEnabled.arbitrum) {
    currencies.push('ARBITRUM')
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

export const getWidgetCurrencies = () => {
  const { core: { hiddenCoinsList } } = store.getState()
  const widgetCurrencies = [
    'BTC',
    'ETH',
    'BNB',
    'MATIC',
    'ARBITRUM',
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
        widgetCurrencies.push(token.name.toUpperCase())
      })
    } else {
      widgetCurrencies.push(config.erc20token.toUpperCase())
    }
  }

  return widgetCurrencies
}

export const filterUserCurrencyData = (currencyData) =>
  currencyData.filter((wallet) =>
    isAllowedCurrency(wallet.currency, wallet.address)
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
