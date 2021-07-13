import bip32 from 'bip32'
import bip39 from 'bip39'
import bitcore from 'bitcore-lib'

import fetch from 'node-fetch'

import { networkType } from './../domain/network'
import bip44 from './../helpers/bip44'
import { 
  ICoin,
  ILibAdapter
} from './interfaces'

const netNames = {
  'mainnet': 'mainnet',
  'testnet': 'testnet',
}

const LTC: ICoin = {
  ticker: 'LTC',
  name: 'Litecoin',
  precision: 8, // ?
  networks: netNames,

  [netNames.mainnet]: {
    type: networkType.mainnet,
    settings: {
      // from https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/test/integration/addresses.spec.ts
      // from https://github.com/litecoin-project/litecore-lib/blob/segwit/lib/networks.js
      port: 9333,
      magic: 0xfbc0b6db,
      messagePrefix: '\x19Litecoin Signed Message:\n',
      base58prefix: {
        pubKeyHash: 0x30,
        scriptHash: 0x32,
        privateKeyWIF: 0xb0,
        publicKeyBIP32: 0x019da462,
        privateKeyBIP32: 0x019d9cfe,
      },
      bip44: {
        coinIndex: 2,
      },
    },
    accountFromMnemonic: (mnemonic) =>
      libAdapter.accountFromMnemonic(mnemonic, netNames.mainnet),
  },

  [netNames.testnet]: {
    type: networkType.testnet,
    settings: {
      // from https://github.com/trezor/trezor-common/pull/80/files
      // from https://github.com/litecoin-project/litecore-lib/blob/segwit/lib/networks.js
      // from https://github.com/litecoin-project/litecoin/blob/master/src/chainparams.cpp
      port: 19335,
      magic: 0xfdd2c8f1,
      messagePrefix: '\x19Litecoin Signed Message:\n',
      base58prefix: {
        pubKeyHash: 0x6f,
        scriptHash: 0xc4,
        privateKeyWIF: 0xef,
        publicKeyBIP32: 0x043587cf,
        privateKeyBIP32: 0x04358394,
      },
      bip44: {
        coinIndex: 1,
      },
    },
    accountFromMnemonic: (mnemonic) =>
      libAdapter.accountFromMnemonic(mnemonic, netNames.testnet),
  }
}

export default LTC



const libAdapter: ILibAdapter = {
  accountFromMnemonic(mnemonic, netName) {
    const network = LTC[netName]
    const settings = network.settings

    // todo: move?

    const seed = bip39.mnemonicToSeedSync(mnemonic)
    const root = bip32.fromSeed(seed, network.bip32settings)
    const derivePath = bip44.createDerivePath(network)
    const child = root.derivePath(derivePath)


    let libNetworkName

    if (netName == netNames.mainnet) {
      libNetworkName = 'litecoin-mainnet'
    }
    if (netName == netNames.testnet) {
      libNetworkName = 'litecoin-testnet'
    }

    if (!libNetworkName) {
      throw new Error(`Unknown network: ${netName}`)
    }

    bitcore.Networks.add({
      name: libNetworkName,
      alias: libNetworkName,
      pubkeyhash: settings.base58prefix.pubKeyHash,
      privatekey: settings.base58prefix.privateKeyWIF,
      scripthash: settings.base58prefix.scriptHash,
      xpubkey: settings.base58prefix.publicKeyBIP32,
      xprivkey: settings.base58prefix.privateKeyBIP32,
      networkMagic: settings.magic,
      port: settings.port
    })

    const libNetwork = bitcore.Networks.get(libNetworkName, 'name')

    const privateKey = new bitcore.PrivateKey(child.toWIF(), libNetwork)
    const publicKey = bitcore.PublicKey.fromPrivateKey(privateKey)
    const address = new bitcore.Address(publicKey, libNetwork)

    const account = {
      privateKey,
      publicKey,
      address
    }

    return account
  },
}



const connector = {
  // "https://testnet.litecore.io"
}
