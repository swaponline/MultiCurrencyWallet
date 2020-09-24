import getCurrencyKey from './getCurrencyKey'
import ethToken from './ethToken'
import actions from 'redux/actions'


const getWalletLink = (currency, checkAddress) => {
  let ourWallets = false
  const isEthToken = ethToken.isEthToken({ name: currency })
  const prefix = getCurrencyKey(currency)

  if (isEthToken) {
    ourWallets = actions.eth.getAllMyAddresses()
  } else {
    if (actions[prefix]
      && typeof actions[prefix].getAllMyAddresses === 'function'
    ) {
      ourWallets = actions[prefix].getAllMyAddresses()
    } else {
      console.warn(`Function getAllMyAddresses not defined (currency ${currency})`)
    }
  }

  if (!ourWallets) return false

  const our = checkAddress.filter((address) => ourWallets.includes(address.toLowerCase()))

  if (our.length) {
    const targetWallet = our[0]

    return (isEthToken) ?
      `/token/${currency.toUpperCase()}/${targetWallet}`
      : `/${prefix.toUpperCase()}/${targetWallet}`
  }

  return false
}


export default getWalletLink
