import getCurrencyKey from './getCurrencyKey'
import transaction from './transactions'
import actions from 'redux/actions'

const getWalletLink = (currency, checkAddresses) => {
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

  const our = checkAddresses.filter((address) => ourWallets.includes(address.toLowerCase()))

  if (our.length) {
    const targetWallet = our[0]

    return tokenBaseCurrency
      ? `/token/${currency}/${targetWallet}`
      : `/${prefix.toUpperCase()}/${targetWallet}`
  }

  return false
}


export default getWalletLink
