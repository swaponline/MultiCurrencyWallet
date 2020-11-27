import SwapApp from 'swap.app'
import * as mnemonicUtils from '../../common/utils/mnemonic'


const loginMnemonic = (mnemonic, walletNumber=0, path, app) => {
  const network = (
    app.isMainNet()
      ? app.env.bitcoin.networks.bitcoin
      : app.env.bitcoin.networks.testnet
  )

  const wallet = mnemonicUtils.getBtcWallet(network, mnemonic, walletNumber, path)

  return login(wallet.WIF, app)
}

const login = (_privateKey, app) => {
  SwapApp.required(app)

  const storageKey = `${app.network}:btc:privateKey`
  let privateKey = _privateKey || app.env.storage.getItem(storageKey)

  let account

  const network = (
    app.isMainNet()
      ? app.env.bitcoin.networks.bitcoin
      : app.env.bitcoin.networks.testnet
  )

  if (!privateKey) {
    privateKey = app.env.bitcoin.ECPair.makeRandom({ network }).toWIF()
  }

  account = new app.env.bitcoin.ECPair.fromWIF(privateKey, network)

  const { address } = app.env.bitcoin.payments.p2pkh({ pubkey: account.publicKey, network })
  const { publicKey } = account

  account.getPublicKey = () => publicKey.toString('hex')
  account.getPublicKeyBuffer = () => publicKey
  account.getPrivateKey = () => privateKey
  account.getAddress = () => address

  if (!_privateKey) {
    app.env.storage.setItem(storageKey, privateKey)
  }

  return account
}


const getPublicData = (account) => ({
  address: account.getAddress(),
  publicKey: account.getPublicKey(),
})


export default {
  login,
  loginMnemonic,
  getPublicData,
}
