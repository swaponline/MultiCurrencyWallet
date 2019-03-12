import { constants } from 'helpers'
import { Keychain } from 'keychain.js'


const login = async () => {
  let keychainKey = localStorage.getItem(constants.privateKeyNames.keychainPublicKey)
  if (!keychainKey) {
    const keychain = await Keychain.create()
    const selectKeyResult = await keychain.selectKey()
    const selectedKey = selectKeyResult.result
    localStorage.setItem(constants.privateKeyNames.keychainPublicKey, selectedKey)
  }
}

const deactivate = async () => {
  localStorage.removeItem(constants.privateKeyNames.keychainPublicKey)
}

export default {
  login,
  deactivate,
}
