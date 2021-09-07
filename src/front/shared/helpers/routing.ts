import getCurrencyKey from './getCurrencyKey'
import transaction from './transactions'
import actions from 'redux/actions'

export const redirectTo = (url) => {
  if (url) {
    if (url.substr(0, 1) !== `#`) url = `#${url}`
    window.location.hash = url
  }
}

export const getTopLocation = (): IUniversalObj => {
  if (window.top) {
    return window.top.location
  }

  return window.location
}

export const getWalletLink = (currency, checkAddresses) => {
  const prefix = getCurrencyKey(currency, false)
  const tokenBaseCurrency = transaction.getTokenBaseCurrency(currency)
  let ourWallets: string[] = []

  if (tokenBaseCurrency) {
    ourWallets = actions[tokenBaseCurrency].getAllMyAddresses()
  } else {
    if (actions[prefix]?.getAllMyAddresses) {
      ourWallets = actions[prefix].getAllMyAddresses()
    } else {
      console.warn(`Function getAllMyAddresses not defined (currency ${currency})`)
    }
  }

  if (!ourWallets.length) return false

  const availableAddresses = checkAddresses.filter((address) => (
    address && ourWallets.includes( address.toLowerCase() )
  ))

  if (availableAddresses.length) {
    const targetWallet = availableAddresses[0]

    return tokenBaseCurrency
      ? `/token/${currency}/${targetWallet}`
      : `/${prefix.toUpperCase()}/${targetWallet}`
  }

  return false
}