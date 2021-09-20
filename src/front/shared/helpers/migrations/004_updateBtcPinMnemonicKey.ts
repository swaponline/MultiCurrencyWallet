import { localStorage, constants } from 'helpers'

const name = 'Update BTC (PIN protected) mnemonic key format'

const run = () => {
  const btcPinMnemonicKey: string | null = localStorage.getItem(
    constants.privateKeyNames.btcPinMnemonicKey
  )

  if (btcPinMnemonicKey) {
    if (Array.isArray(btcPinMnemonicKey) && btcPinMnemonicKey.length) {
      localStorage.setItem(constants.privateKeyNames.btcPinMnemonicKey, btcPinMnemonicKey[0], false)
    }
  }

  return Promise.resolve()
}

export default {
  name,
  run,
}
