import { constants } from 'helpers'
import { Keychain } from 'keychain.js'


const getLocalStorageName = (currency) =>
  currency === 'ETH' ? constants.privateKeyNames.ethKeychainPublicKey : constants.privateKeyNames.btcKeychainPublicKey

const login = async (currency) => {
  const localStorageName = getLocalStorageName(currency)
  let keychainKey = localStorage.getItem(localStorageName)
  if (!keychainKey) {
    const keychain = await Keychain.create()
    const selectKeyResult = await keychain.selectKey()
    return selectKeyResult.result
  }
}

const deactivate = async (currency) => {
  localStorage.removeItem(getLocalStorageName(currency))
}

export default {
  login,
  deactivate,
}
