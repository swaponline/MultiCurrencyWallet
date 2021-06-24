import SwapApp from 'swap.app'
import * as mnemonicUtils from 'common/utils/mnemonic'


const loginMnemonic = (mnemonic, walletNumber = 0, path, app) => {
  const wallet = mnemonicUtils.getEthLikeWallet({ mnemonic, walletNumber, path })
  return login(wallet.privateKey, app)
}

const login = (_privateKey, app) => {
  SwapApp.required(app)

  const storageKey = `${app.network}:arbitrum:privateKey`
  const privateKey = _privateKey || app.env.storage.getItem(storageKey)
  let account

  if (privateKey) {
    account = app.env.web3Arbitrum.eth.accounts.privateKeyToAccount(privateKey)
  }
  else {
    account = app.env.web3Arbitrum.eth.accounts.create()
  }

  app.env.web3Arbitrum.eth.accounts.wallet.add(account.privateKey)

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
