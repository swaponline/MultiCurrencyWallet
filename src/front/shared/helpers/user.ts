import store from 'redux/store'
import { externalConfig, links, getItezUrl } from 'helpers'
import TOKEN_STANDARDS from 'helpers/constants/TOKEN_STANDARDS'

export const getActivatedCurrencies = () => {
  const currencies: string[] = []

  if (!externalConfig.opts.curEnabled || externalConfig.opts.curEnabled.btc) {
    currencies.push('BTC')
    currencies.push('BTC (SMS-Protected)')
    currencies.push('BTC (PIN-Protected)')
    currencies.push('BTC (Multisig)')
  }

  if (!externalConfig.opts.curEnabled || externalConfig.opts.curEnabled.eth) {
    currencies.push('ETH')
  }

  if (!externalConfig.opts.curEnabled || externalConfig.opts.curEnabled.bnb) {
    currencies.push('BNB')
  }

  if (!externalConfig.opts.curEnabled || externalConfig.opts.curEnabled.matic) {
    currencies.push('MATIC')
  }

  if (!externalConfig.opts.curEnabled || externalConfig.opts.curEnabled.arbeth) {
    currencies.push('ARBETH')
  }

  if (!externalConfig.opts.curEnabled || externalConfig.opts.curEnabled.ghost) {
    currencies.push('GHOST')
  }

  if (!externalConfig.opts.curEnabled || externalConfig.opts.curEnabled.next) {
    currencies.push('NEXT')
  }

  Object.keys(TOKEN_STANDARDS).forEach((key) => {
    const standard = TOKEN_STANDARDS[key].standard

    Object.keys(externalConfig[standard]).forEach((token) => {

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
      widgetCurrencies.push(externalConfig.erc20token.toUpperCase())
    }
  }

  return widgetCurrencies
}

export const filterUserCurrencyData = (currencyData) =>
  currencyData.filter((wallet) =>
    isAllowedCurrency(wallet.isToken ? wallet.tokenKey.toUpperCase() : wallet.currency, wallet.address, wallet.isMetamask)
  )

export const isAllowedCurrency = (currency = '', address = '', isMetamask = false) => {
  const { core: { hiddenCoinsList } } = store.getState()
  const enabledCurrencies = getActivatedCurrencies()

  return (
    ((!hiddenCoinsList.includes(currency) && !hiddenCoinsList.includes(`${currency}:${address}`))
      || isMetamask) &&
    enabledCurrencies.includes(currency)
  )
}

export const isCorrectWalletToShow = (wallet) => {
  return !wallet.isMetamask || (wallet.isConnected && !wallet.unknownNetwork)
}

export const getTransakLink = (params) => {
  if (!window.transakApiKey) return ''

  const { currency = '', walletAddress = '' } = params
  const { user } = store.getState()

  const isLocalHost = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
  const hostURL = window.location.origin
  let environment = 'STAGING'
  let exchangeUrl = links.transakDev

  if (externalConfig.entry === 'mainnet') {
    environment = 'PRODUCTION'
    exchangeUrl = links.transak
  }

  const parameters = [
    // required parameters
    `?apiKey=${window.transakApiKey}`,
    `&hostURL=${hostURL}`,
    `&environment=${environment}`,
    // if we have the crypto in the parameters, sometimes
    // we don't have the ability to buy this crypto with
    // an user active fiat. In this case after redirection
    // Transak will drop his crypto field to the default value
    // which is available for the fiat value that we've passed.
    // `&fiatCurrency=${user.activeFiat}`,
  ]
  
  if (!isLocalHost) {
    parameters.push(`&redirectURL=${hostURL}`)
  }
  if (walletAddress) {
    parameters.push(`&walletAddress=${walletAddress}`)
  }
  if (currency) {
    parameters.push(`&defaultCryptoCurrency=${currency.toUpperCase()}`)
  }

  return exchangeUrl + parameters.join('')
}

export const getExternalExchangeLink = (params) => {
  const { address = '', currency = '', locale = 'en' } = params
  const { user } = store.getState()
  let link = ''

  if (window.transakApiKey) {
    link = getTransakLink({
      walletAddress: address,
      currency,
    })
  } else if (externalConfig?.opts?.buyViaCreditCardLink) {
    link = externalConfig.opts.buyViaCreditCardLink

    // checking whether the currency is available in ITEZ
    if (link.match(/itez\.com/g) && currency) {
      const itezCrypto = ['BTC', 'ETH', 'MATIC']
      const match = itezCrypto.find((itezAsset) => currency.toUpperCase().includes(itezAsset))

      if (match) {
        link = getItezUrl({ user, locale, url: externalConfig.opts.buyViaCreditCardLink })
      } else {
        link = ''
      }
    }
  }

  return link
}