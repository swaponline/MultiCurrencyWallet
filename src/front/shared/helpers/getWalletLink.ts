import getCurrencyKey from './getCurrencyKey'
import actions from 'redux/actions'
import erc20Like from 'common/erc20Like'

const getWalletLink = (currency, checkAddress) => {
  let ourWallets: string[] = []
  const isToken = erc20Like.isToken({ name: currency })
  const prefix = getCurrencyKey(currency, false)

  if (isToken) {
    if (erc20Like.erc20.isToken({ name: currency })) {
      ourWallets = actions.eth.getAllMyAddresses()
    } else if (erc20Like.bep20.isToken({ name: currency })) {
      ourWallets = actions.bnb.getAllMyAddresses()
    }
  } else {
    if (actions[prefix]?.getAllMyAddresses) {
      ourWallets = actions[prefix].getAllMyAddresses()
    } else {
      console.warn(`Function getAllMyAddresses not defined (currency ${currency})`)
    }
  }

  if (!ourWallets.length) return false

  const our = checkAddress.filter((address) => ourWallets.includes(address.toLowerCase()))

  if (our.length) {
    const targetWallet = our[0]

    return isToken
      ? `/token/${currency.toUpperCase()}/${targetWallet}`
      : `/${prefix.toUpperCase()}/${targetWallet}`
  }

  return false
}


export default getWalletLink
