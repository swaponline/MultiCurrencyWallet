import SwapApp from 'swap.app'
import { getBchWallet } from '../../common/utils/mnemonic'


const loginMnemonic = (mnemonic, walletNumber=0, path, app) => {
  /* not implements */
  console.warn('swap.auth bch mnemonic login not implements')
}

const login = (_privateKey, app) => {
  SwapApp.required(app)

  const storageKey = `${app.network}:bch:privateKey`
  let privateKey = _privateKey || app.env.storage.getItem(storageKey)
  let account

  const network = (
    app.isMainNet()
      ? app.env.coininfo.bitcoincash.main
      : app.env.coininfo.bitcoincash.test
  ).toBitcoinJS()

  if (!privateKey) {
    privateKey = app.env.bitcoincash.ECPair.makeRandom({ network }).toWIF()
  }

  account = new app.env.bitcoincash.ECPair.fromWIF(privateKey, network)

  account.getPublicKey = () => account.getPublicKeyBuffer().toString('hex')
  account.getPrivateKey = () => privateKey

  if (!_privateKey) {
    app.env.storage.setItem(storageKey, privateKey)
  }

  return account
}

const getPublicData = (account, app) => ({
  address: app.env.bchaddr.toCashAddress(account.getAddress()),
  publicKey: account.getPublicKey(),
})


export default {
  login,
  loginMnemonic,
  getPublicData,
}
