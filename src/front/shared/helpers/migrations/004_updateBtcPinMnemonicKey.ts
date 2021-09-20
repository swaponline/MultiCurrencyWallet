import { localStorage, constants } from 'helpers'

const name = 'Update BTC (PIN protected) mnemonic key format'

const run = () => {
  const btcPinMnemonicKey: string | null = localStorage.getItem(
    constants.privateKeyNames.btcPinMnemonicKey
  )

  if (btcPinMnemonicKey) {
    try {
      // try to parse the old format when a key in the array
      const keyArray = JSON.parse(btcPinMnemonicKey)

      if (Array.isArray(keyArray) && keyArray.length) {
        localStorage.setItem(constants.privateKeyNames.btcPinMnemonicKey, keyArray[0])
      }
    } catch {
      // can't parse a string key. Let's leave it as it is
    }
  }

  return Promise.resolve()
}

export default {
  name,
  run,
}
