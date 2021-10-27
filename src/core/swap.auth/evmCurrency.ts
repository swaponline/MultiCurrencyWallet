import SwapApp from 'swap.app'
import * as mnemonicUtils from '../../common/utils/mnemonic'

const loginMnemonic = (params) => {
  const { currencyKey, mnemonic, walletNumber = 0, path, app } = params
  const wallet = mnemonicUtils.getEvmWallet({ mnemonic, walletNumber, path })

  return login({ _privateKey: wallet.privateKey, app, currencyKey })
}

const login = (params) => {
  const { _privateKey, app, currencyKey } = params
  SwapApp.required(app)

  const capitalizedName = currencyKey.charAt(0).toUpperCase() + currencyKey.toLowerCase().slice(1)
  const web3Key = `web3${capitalizedName}`
  const storageKey = `${app.network}:${capitalizedName.toLowerCase()}:privateKey`
  const privateKey = _privateKey || app.env.storage.getItem(storageKey)

  let account

  if (privateKey) {
    account = app.env[web3Key].eth.accounts.privateKeyToAccount(privateKey)
  } else {
    account = app.env[web3Key].eth.accounts.create()
  }

  app.env[web3Key].eth.accounts.wallet.add(account.privateKey)

  if (!_privateKey) {
    app.env.storage.setItem(storageKey, account.privateKey)
  }

  return account
}

const getPublicData = (account) => ({
  address: account.address,
  publicKey: null,
})

export default {
  login,
  loginMnemonic,
  getPublicData,
}
