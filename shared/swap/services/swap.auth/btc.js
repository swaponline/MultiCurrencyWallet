import SwapApp from '../../swap.app'


const login = (_privateKey) => {
  const storageKey = `${SwapApp.network}:btc:privateKey`
  let privateKey = _privateKey || SwapApp.env.storage.getItem(storageKey)
  let account

  if (!privateKey) {
    privateKey = SwapApp.env.bitcoin.ECPair.makeRandom({ network: SwapApp.env.bitcoin.networks.testnet }).toWIF()
  }

  account = new SwapApp.env.bitcoin.ECPair.fromWIF(privateKey, SwapApp.env.bitcoin.networks.testnet)

  account.__proto__.getPublicKey = () => account.getPublicKeyBuffer().toString('hex')
  account.__proto__.getPrivateKey = () => privateKey

  SwapApp.env.storage.setItem(storageKey, privateKey)

  return account
}

const getPublicData = (account) => ({
  address: account.address,
  publicKey: account.getPublicKey(),
})


export default {
  login,
  getPublicData,
}
