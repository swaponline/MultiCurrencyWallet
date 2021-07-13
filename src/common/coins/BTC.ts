import bip32 from 'bip32'
import bip39 from'bip39'
import bitcore from 'bitcore-lib'

import fetch from 'node-fetch'
import BigNumber from 'bignumber.js'

import { networkType } from './../domain/network'
import bip44 from './../helpers/bip44'
import { 
  ICoin,
  ILibAdapter,
  IConnector
} from './interfaces'

const netNames = {
  'mainnet': 'mainnet',
  'testnet': 'testnet',
}

const BTC: ICoin = {
  ticker: 'BTC',
  name: 'Bitcoin',
  precision: 8,
  networks: netNames,

  [netNames.mainnet]: {
    type: networkType.mainnet,
    settings: {
      // from https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/src/networks.js
      port: 0, // ?
      magic: 0, // ? (aka pchMessageStart)
      messagePrefix: '\x18Bitcoin Signed Message:\n',
      base58prefix: {
        pubKeyHash: 0x00,
        scriptHash: 0x05,
        privateKeyWIF: 0x80,
        publicKeyBIP32: 0x0488b21e,
        privateKeyBIP32: 0x0488ade4,
      },
      bip44: {
        coinIndex: 0,
      },
    },
    accountFromMnemonic: (mnemonic) =>
      libAdapter.accountFromMnemonic(mnemonic, netNames.mainnet),
    getBalance: async (addr) =>
      await connector.fetchBalance(networkType.mainnet, addr),
    //publishTx: async (rawTx) => await publishTx(networkType.testnet, rawTx)
    getTxUrl: (txId) =>
      connector.getTxUrl(networkType.mainnet, txId),
  },

  [netNames.testnet]: {
    type: networkType.testnet,
    settings: {
      // from https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/src/networks.js
      port: 0, //?
      magic: 0, //?
      messagePrefix: '\x18Bitcoin Signed Message:\n',
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
    getBalance: async (addr) =>
      await connector.fetchBalance(networkType.testnet, addr),
    publishTx: async (rawTx) =>
      //@ts-ignore: strictNullChecks
      await connector.publishTx(networkType.testnet, rawTx),
    getTxUrl: (txId) =>
      connector.getTxUrl(networkType.testnet, txId),
  }
}

export default BTC



const libAdapter: ILibAdapter = {
  accountFromMnemonic(mnemonic, netName) {
    const network = BTC[netName]
    const settings = network.settings

    // todo: move?

    const seed = bip39.mnemonicToSeedSync(mnemonic)
    const root = bip32.fromSeed(seed, {
      wif: settings.base58prefix.privateKeyWIF,
      bip32: {
        public: settings.base58prefix.publicKeyBIP32,
        private: settings.base58prefix.privateKeyBIP32,
      },
      messagePrefix: settings.messagePrefix,
      pubKeyHash: settings.pubKeyHash,
      scriptHash: settings.scriptHash,
    })
    const derivePath = bip44.createDerivePath(network)
    const child = root.derivePath(derivePath)


    let libNetwork, libNetworkName

    if (netName == netNames.mainnet) {
      libNetwork = bitcore.Networks.mainnet
    }

    if (netName == netNames.testnet) {
      libNetwork = bitcore.Networks.testnet
    }

    if (!libNetwork) {
      throw new Error(`Unknown network: ${netName}`)
    }

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



const connector: IConnector = {

  // bitcore API documentation:
  // https://github.com/bitpay/bitcore/blob/master/packages/bitcore-node/docs/api-documentation.md

  getApiUrl(netwType) {
    if (netwType === networkType.mainnet) {
      return 'https://api.bitcore.io/api/BTC/mainnet'
    }
    if (netwType === networkType.testnet) {
      return 'https://api.bitcore.io/api/BTC/testnet'
    }
    throw new Error('Unknown networkType')
  },

  //@ts-ignore: strictNullChecks
  getTxUrl(netType, txId) {
    if (netType == networkType.mainnet) {
      return `https://www.blockchain.com/btc/tx/${txId}`
    }
    if (netType == networkType.testnet) {
      return `https://www.blockchain.com/btc-testnet/tx/${txId}`
    }
  },

  async fetchBalance(networkType, address) {
    const apiUrl = connector.getApiUrl(networkType);
    const response = await fetch(`${apiUrl}/address/${address}/balance`);
    const json = await response.json();
    const balanceSat = json.balance;
    const balanceBTC = (new BigNumber(balanceSat)).dividedBy(10 ** BTC.precision)
    return balanceBTC.toNumber();
  },

  async publishTx(networkType, rawTx) {
    const apiUrl = connector.getApiUrl(networkType);
    const response = await fetch(`${apiUrl}/tx/send`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({'rawTx': rawTx}),
    })
    const json = await response.json()
    return json
  },

}

