import * as bitcoin from 'bitcoinjs-lib'
import * as bip32 from 'bip32'
import { hdkey } from 'ethereumjs-wallet'
import * as bip39 from 'bip39'
import Slip39 from './slip39/slip39.js'
import * as slipHelper from './slip39/slip39_helper.js'


const getRandomMnemonicWords = () => {
  return bip39.generateMnemonic()
}

const validateMnemonicWords = (mnemonic) => {
  return bip39.validateMnemonic(convertMnemonicToValid(mnemonic))
}

// Shamir's Secret Sharing alternative to saving 12 words seed (Split mnemonic to three secrets)
const splitMnemonicToSecretParts = (mnemonic, passphrase = ``) => {
  mnemonic = convertMnemonicToValid(mnemonic)
  const mnemonicEntropy: string = bip39.mnemonicToEntropy(mnemonic)
  const masterSecret: number[] = slipHelper.toByteArray(mnemonicEntropy)

  const getMnemonicInt = (mnemonic) => {
    return slipHelper.intFromIndices(slipHelper.mnemonicToIndices(mnemonic))
  }

  const slip = Slip39.fromArray(masterSecret, {
    passphrase,
    threshold: 2, // number of group-shares required to reconstruct the master secret.
    groups: [
      [1, 1], [1, 1], [1, 1] // split master key to 3 parts
    ]
  })
  
  const mnemonics = [
    slip.fromPath('r/0/0').mnemonics[0],
    slip.fromPath('r/1/0').mnemonics[0],
    slip.fromPath('r/2/0').mnemonics[0]
  ]

  const secretParts = [
    getMnemonicInt(mnemonics[0]),
    getMnemonicInt(mnemonics[1]),
    getMnemonicInt(mnemonics[2])
  ]
  return {
    mnemonics,
    secretParts
  }
}

// Shamir's Secret Sharing alternative to saving 12 words seed (Restore mnemonic from two secrets)
const restoryMnemonicFromSecretParts = (secretParts, isMnemonics = false, passphrase = ``) => {
  // prepare mnemonics 
  const mnemonics: string[] = (isMnemonics)
    ? secretParts
    : secretParts.map((mnemonicInt) => {
      return slipHelper.mnemonicFromIndices(
        slipHelper.intToIndices(
          (typeof(mnemonicInt) === 'string')
            ? BigInt(`${mnemonicInt}`)
            : mnemonicInt,
          20,
          10
        )
      )
    })
  // do recover
  const recoveredEntropy = Slip39.recoverSecret(mnemonics, passphrase)
  const recoveredMnemonic = bip39.entropyToMnemonic(recoveredEntropy)
  return recoveredMnemonic
}

// Shamir's Secret Sharing alternative to saving 12 words seed (Check secret is valid)
const isValidShamirsSecret = (secret) => {
  try {
    const secretInt = (typeof(secret) === 'string') ? BigInt(`${secret}`) : secret
    const mnemonicIndices = slipHelper.intToIndices(secretInt, 20, 10)
    const mnemonic = slipHelper.mnemonicFromIndices(mnemonicIndices)
    return slipHelper.validateMnemonic(mnemonic)
  } catch (e) {
    return false
  }
}

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
    publicKey: node.publicKey.toString('hex'),
    WIF: node.toWIF(),
    node,
    account,
  }
}

const getEthLikeWallet = (params) => {
  const { mnemonic, walletNumber = 0, path } = params
  const validMnemonic = convertMnemonicToValid(mnemonic)
  const seed = bip39.mnemonicToSeedSync(validMnemonic)
  const hdwallet = hdkey.fromMasterSeed(seed)
  const wallet = hdwallet.derivePath((path) || `m/44'/60'/0'/0/${walletNumber}`).getWallet()
  const publicKey = wallet.getPublicKey()
  const privateKey = wallet.getPrivateKey()

  return {
    mnemonic: validMnemonic,
    address: `0x${wallet.getAddress().toString('hex')}`,
    publicKey: `0x${publicKey.toString('hex')}`,
    privateKey: `0x${privateKey.toString('hex')}`,
    wallet,
  }
}

const getGhostWallet = (network, mnemonic, walletNumber = 0, path) => {
  const seed = bip39.mnemonicToSeedSync(mnemonic)
  const root = bip32.fromSeed(seed, network)
  const node = root.derivePath((path) || `m/44'/0'/0'/0/${walletNumber}`)

  const account = bitcoin.payments.p2pkh({
    pubkey: node.publicKey,
    network: network,
  })

  return {
    mnemonic,
    address: account.address,
    publicKey: node.publicKey.toString('hex'),
    WIF: node.toWIF(),
    node,
    account,
  }
}

const getNextWallet = (network, mnemonic, walletNumber = 0, path) => {
  const seed = bip39.mnemonicToSeedSync(mnemonic)
  const root = bip32.fromSeed(seed, network)
  const node = root.derivePath((path) || `m/44'/707'/0'/0/${walletNumber}`)

  const account = bitcoin.payments.p2pkh({
    pubkey: node.publicKey,
    network: network,
  })

  return {
    mnemonic,
    address: account.address,
    publicKey: node.publicKey.toString('hex'),
    WIF: node.toWIF(),
    node,
    account,
  }
}

const mnemonicIsValid = (mnemonic:string):boolean => bip39.validateMnemonic(convertMnemonicToValid(mnemonic))

export {
  getRandomMnemonicWords,
  validateMnemonicWords,
  mnemonicIsValid,
  convertMnemonicToValid,
  getBtcWallet,
  getEthLikeWallet,
  getGhostWallet,
  getNextWallet,
  splitMnemonicToSecretParts,
  restoryMnemonicFromSecretParts,
  isValidShamirsSecret,
}