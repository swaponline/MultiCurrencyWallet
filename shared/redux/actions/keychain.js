import { constants } from 'helpers'
import { Keychain } from 'keychain.js'


const login = async () => {
  let keychainKey = localStorage.getItem(constants.privateKeyNames.keychain.publicKey)
  if (!keychainKey) {
    const keychain = await Keychain.create()
    const selectKeyResult = await keychain.selectKey()
    const selectedKey = selectKeyResult.result
    localStorage.setItem(constants.privateKeyNames.keychain.publicKey, selectedKey)
  }
}

const deactivate = async () => {
  localStorage.removeItem(constants.privateKeyNames.keychain.publicKey)
}

export default {
  login,
  deactivate,
}
