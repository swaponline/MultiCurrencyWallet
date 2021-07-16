import bip32 from 'bip32'
import bip39 from 'bip39'
import bitcore from 'bitcore-lib'

import fetch from 'node-fetch'

import { networkType } from './../domain/network'
import bip44 from './../helpers/bip44'
import { 
  ICoin,
  ILibAdapter,
  IConnector
} from './interfaces'


const netNames = {
  'mainnet': 'mainnet',
  //'testnet': 'testnet', // testnet is down
}

const NEXT: ICoin = {
  ticker: 'NEXT',
  name: 'NEXT.coin',
  precision: 8,
  networks: netNames,

  [netNames.mainnet]: {
    type: networkType.mainnet,
    settings: {
      port: 7077,
      magic: 0xcbe4d0a1,
      messagePrefix: 'Nextcoin Signed Message:\n',
      base58prefix: {
        pubKeyHash: 75,
        scriptHash: 5,
        privateKeyWIF: 128,
        publicKeyBIP32: 0x0488B21E,
        privateKeyBIP32: 0x0488ADE4,
      },
      bip44: {
        coinIndex: 707,
      },
    },
    accountFromMnemonic: (mnemonic) =>
      libAdapter.accountFromMnemonic(mnemonic, netNames.mainnet),
    getBalance: async (addr) =>
      await connector.fetchBalance(networkType.mainnet, addr),
    createTx: async ({ account, amount, to }) =>
      //@ts-ignore: strictNullChecks
      await libAdapter.createTx({
        netName: netNames.mainnet,
        account,
        amount,
        to
      }),
    publishTx: async (rawTx) =>
      //@ts-ignore: strictNullChecks
      await connector.publishTx(networkType.mainnet, rawTx),
    getTxUrl: (txId) =>
      connector.getTxUrl(networkType.mainnet, txId),
    get _connector() { // todo: remove
      return connector
    },
  },

  // testnet is down

}

export default NEXT



const libAdapter: ILibAdapter = {
  accountFromMnemonic(mnemonic, netName) {
    const network = NEXT[netName]
    const settings = network.settings

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


    const libNetworkName = 'next-mainnet'
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

  async createTx({ netName, account, amount, to }) {
    const { privateKey, publicKey, address } = account

    const network = NEXT[netName]
    const addressStr = address.toString()
    //@ts-ignore: strictNullChecks
    const unspent: bitcore.Transaction.UnspentOutput[] = await connector.fetchUnspents(network.type, addressStr)

    const tx = new bitcore.Transaction()
      .from(unspent)
      .to(to, amount)  // [sat]
      .change(address)  // Where the rest of the funds will go
      .sign(privateKey) // Signs all the inputs it can

    const rawTx = tx.serialize() // raw tx to broadcast
    return rawTx
  }

}



const connector: IConnector = {

  // next.exhnage API documentation:
  // https://explore.next.exchange/#/api

  getApiUrl(netType) {
    if (netType === networkType.mainnet) {
      return 'https://explore.next.exchange/api'
    }
    // testnet is down
    /*if (netwType === networkType.testnet) {
      return '' // ?
    }*/
    throw new Error('Unknown networkType')
  },

  getTxUrl(netType, txId) {
    if (netType == networkType.mainnet) {
      return `https://explore.next.exchange/#/tx/${txId}`
    }
    // testnet is down
    /*if (netType == networkType.testnet) {
      return '' // ?
    }*/
    throw new Error('Unknown networkType')
  },

  async fetchBalance(networkType, address) {
    const apiUrl = connector.getApiUrl(networkType);
    const response = await fetch(`${apiUrl}/address/${address}`);
    try {
      const json = await response.json();
      return json.balance;
    } catch (e) { // todo: improve
      return 0
    }
  },

  async fetchUnspents(netType, addr) {

    //const apiUrl = 'http://localhost:7079'
    const apiUrl = 'https://next.swaponline.io/mainnet'

    const response = await fetch(`${apiUrl}/${netType}/addr/${addr}/utxo`);
    console.log(response)

    if (response.status !== 200) {
      throw new Error(`Can't fetch unspents - ${response.status}, ${response.statusText}`)
    }

    const json = await response.json();
    return json;
    //
  },

  async publishTx(networkType, rawTx) {
    const apiUrl = connector.getApiUrl(networkType);
    const response = await fetch(`${apiUrl}/sendrawtransaction`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({'rawtx': rawTx}),
    })
    const json = await response.json()
    if (!json.raw) {
      throw new Error(`Can't publish tx, answer = ${JSON.stringify(json)}`)
    }
    return json.raw
  },

}
