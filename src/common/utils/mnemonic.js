import * as bitcoin from 'bitcoinjs-lib'
import * as bip32 from 'bip32'
import * as hdkey from 'ethereumjs-wallet/hdkey'
import * as bip39 from 'bip39'



const convertMnemonicToValid = (mnemonic) => {
  return mnemonic
    .trim()
    .toLowerCase()
    .split(` `)
    .filter((word) => word)
    .join(` `)
}


const getBtcWallet = (network, mnemonic, walletNumber = 0, path) => {
  mnemonic = convertMnemonicToValid(mnemonic)
  const seed = bip39.mnemonicToSeedSync(mnemonic)
  const root = bip32.fromSeed(seed, network)
  const node = root.derivePath((path) ? path : `m/44'/0'/0'/0/${walletNumber}`)

  const account = bitcoin.payments.p2pkh({
    pubkey: node.publicKey,
    network: network,
  })

  return {
    mnemonic,
    address: account.address,
    publicKey: node.publicKey.toString('Hex'),
    WIF: node.toWIF(),
    node,
    account,
  }
}

const getEthWallet = (network, mnemonic, walletNumber = 0, path) => {
  mnemonic = convertMnemonicToValid(mnemonic)
  const seed = bip39.mnemonicToSeedSync(mnemonic)
  const hdwallet = hdkey.fromMasterSeed(seed)
  const wallet = hdwallet.derivePath((path) || `m/44'/60'/0'/0/${walletNumber}`).getWallet()

  return {
    mnemonic,
    address: `0x${wallet.getAddress().toString('Hex')}`,
    publicKey: `0x${wallet.pubKey.toString('Hex')}`,
    privateKey: `0x${wallet.privKey.toString('Hex')}`,
    wallet,
  }
}

const getGhostWallet = (network, mnemonic, walletNumber = 0, path) => {
  const seed = bip39.mnemonicToSeedSync(mnemonic)
  const root = bip32.fromSeed(seed, ghost.network)
  const node = root.derivePath((path) || `m/44'/0'/0'/0/${walletNumber}`)

  const account = bitcoin.payments.p2pkh({
    pubkey: node.publicKey,
    network: ghost.network,
  })

  return {
    mnemonic,
    address: account.address,
    publicKey: node.publicKey.toString('Hex'),
    WIF: node.toWIF(),
    node,
    account,
  }
}

const getNextWallet = (network, mnemonic, walletNumber = 0, path) => {
  const seed = bip39.mnemonicToSeedSync(mnemonic)
  const root = bip32.fromSeed(seed, next.network)
  const node = root.derivePath((path) || `m/44'/707'/0'/0/${walletNumber}`)

  const account = bitcoin.payments.p2pkh({
    pubkey: node.publicKey,
    network: next.network,
  })

  return {
    mnemonic,
    address: account.address,
    publicKey: node.publicKey.toString('Hex'),
    WIF: node.toWIF(),
    node,
    account,
  }
}

export {
  convertMnemonicToValid,
  getBtcWallet,
  getEthWallet,
  getGhostWallet,
  getNextWallet,
}