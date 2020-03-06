import BigInteger from 'bigi'

import { BigNumber } from 'bignumber.js'
import * as bitcoin from 'bitcoinjs-lib'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'

import bitcoinMessage from 'bitcoinjs-message'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import { btc, apiLooper, constants, api } from 'helpers'
import { Keychain } from 'keychain.js'
import actions from 'redux/actions'
import typeforce from "swap.app/util/typeforce";


const getRandomMnemonicWords = () => bip39.generateMnemonic()
const validateMnemonicWords = (mnemonic) => bip39.validateMnemonic(mnemonic)

window.bip39 = bip39

const getWalletByWords = (mnemonic, path) => {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed, btc.network);
  const node = root.derivePath((path) ? path : "m/44'/0'/0'/0/0")

  const account = bitcoin.payments.p2pkh({
    pubkey: node.publicKey,
    network: btc.network,
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

window.getWalletByWords = getWalletByWords

const login = (privateKey) => {
  let keyPair

  if (privateKey) {
    const hash  = bitcoin.crypto.sha256(privateKey)
    const d     = BigInteger.fromBuffer(hash)

    keyPair     = bitcoin.ECPair.fromWIF(privateKey, btc.network)
  }
  else {
    console.info('Created account Bitcoin ...')
    //keyPair     = bitcoin.ECPair.makeRandom({ network: btc.network })
    //privateKey  = keyPair.toWIF()
    // use random 12 words
    const mnemonic = bip39.generateMnemonic()
    const accData = getWalletByWords(mnemonic)
    console.log('Btc. Generated walled from random 12 words')
    console.log(accData)
    privateKey = accData.WIF
  }

  localStorage.setItem(constants.privateKeyNames.btc, privateKey)

  const account         = bitcoin.ECPair.fromWIF(privateKey, btc.network) // eslint-disable-line
  const { address }     = bitcoin.payments.p2pkh({ pubkey: account.publicKey, network: btc.network })
  const { publicKey }   = account

  const data = {
    account,
    keyPair,
    address,
    privateKey,
    publicKey,
  }

  window.getBtcAddress = () => data.address
  window.getBtcData = () => data

  console.info('Logged in with Bitcoin', data)
  reducers.user.setAuthData({ name: 'btcData', data })
  return privateKey
}

const loginWithKeychain = async () => {
  const selectedKey = await actions.keychain.login('BTC')

  const pubkey = Buffer.from(`03${selectedKey.substr(0, 64)}`, 'hex')
  const keyPair = bitcoin.ECPair.fromPublicKeyBuffer(pubkey, btc.network)
  const address = keyPair.getAddress()

  const data = {
    address,
    publicKey: selectedKey,
  }

  window.getBtcAddress = () => data.address

  console.info('Logged in with Bitcoin', data)
  reducers.user.setAuthData({ name: 'btcData', data })
  localStorage.setItem(constants.privateKeyNames.btcKeychainPublicKey, selectedKey)
  localStorage.removeItem(constants.privateKeyNames.btc)
  await getBalance()
}

const getTx = (txRaw) => {

  return txRaw.getId()
}

const getLinkToInfo = (tx) => {

  if(!tx) {
    return
  }

  return `${config.link.bitpay}/tx/${tx}`
}

const getBalance = () => {
  const { user: { btcData: { address } } } = getState()

  return apiLooper.get('bitpay', `/addr/${address}`, {
    checkStatus: (answer) => {
      try {
        if (answer && answer.balance !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
  }).then(({ balance, unconfirmedBalance }) => {
      console.log('BTC Balance: ', balance)
      console.log('BTC unconfirmedBalance Balance: ', unconfirmedBalance)
      reducers.user.setBalance({ name: 'btcData', amount: balance, unconfirmedBalance })
      return balance
    })
    .catch((e) => {
      reducers.user.setBalanceError({ name: 'btcData' })
    })
}

const fetchBalance = (address) =>
  apiLooper.get('bitpay', `/addr/${address}`, {
    checkStatus: (answer) => {
      try {
        if (answer && answer.balance !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
  }).then(({ balance }) => balance)

const fetchTx = (hash) =>
  apiLooper.get('bitpay', `/tx/${hash}`, {
    checkStatus: (answer) => {
      try {
        if (answer && answer.fees !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
  }).then(({ fees, ...rest }) => ({
      fees: BigNumber(fees).multipliedBy(1e8),
      ...rest,
    }))

const fetchTxInfo = (hash) =>
  fetchTx(hash)
    .then(({ vin, vout, ...rest }) => ({
      senderAddress: vin ? vin[0].addr : null,
      receiverAddress: vout ? vout[0].scriptPubKey.addresses : null,
      ...rest,
    }))

const getInvoices = () => {
  const { user: { btcData: { address } } } = getState()

  return actions.invoices.getInvoices({
    currency: 'BTC',
    address,
  })
}

const getTransaction = (address, ownType) =>
  new Promise((resolve) => {
    let { user: { btcData: { address : userAddress } } } = getState()
    address = address || userAddress

    const type = (ownType) ? ownType : 'btc'

    if(!typeforce.isCoinAddress['BTC'](address)) {
      resolve([])
    }

    const url = `/txs/?address=${address}`
    return apiLooper.get('bitpay', url, {
      checkStatus: (answer) => {
        try {
          if (answer && answer.txs !== undefined) return true
        } catch (e) { /* */ }
        return false
      },
    }).then((res) => {
        
        const transactions = res.txs.map((item) => {
          const direction = item.vin[0].addr !== address ? 'in' : 'out'
          const isSelf = direction === 'out'
            && item.vout.filter((item) =>
              item.scriptPubKey.addresses[0] === address
            ).length === item.vout.length

          return ({
            type,
            hash: item.txid,
            canEdit: address === userAddress,
            confirmations: item.confirmations,
            value: isSelf
              ? item.fees
              : item.vout.filter((item) => {
                const currentAddress = item.scriptPubKey.addresses[0]

                return direction === 'in'
                  ? (currentAddress === address)
                  : (currentAddress !== address)
              })[0].value,
            date: item.time * 1000,
            direction: isSelf ? 'self' : direction,
          })
        })
        resolve(transactions)
      })
      .catch(() => {
        resolve([])
      })
  })

const send = async ({ from, to, amount, feeValue, speed } = {}) => {
  feeValue = feeValue || await btc.estimateFeeValue({ inSatoshis: true, speed })

  const tx            = new bitcoin.TransactionBuilder(btc.network)
  const unspents      = await fetchUnspents(from)

  const fundValue     = new BigNumber(String(amount)).multipliedBy(1e8).integerValue().toNumber()
  const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
  const skipValue     = totalUnspent - fundValue - feeValue

  unspents.forEach(({ txid, vout }) => tx.addInput(txid, vout, 0xfffffffe))
  tx.addOutput(to, fundValue)

  if (skipValue > 546) {
    tx.addOutput(from, skipValue)
  }

  const keychainActivated = !!localStorage.getItem(constants.privateKeyNames.btcKeychainPublicKey)
  const txRaw = keychainActivated ? await signAndBuildKeychain(tx, unspents) : signAndBuild(tx)

  await broadcastTx(txRaw.toHex())

  return txRaw
}

const signAndBuild = (transactionBuilder) => {
  const { user: { btcData: { privateKey } } } = getState()
  const keyPair = bitcoin.ECPair.fromWIF(privateKey, btc.network)

  transactionBuilder.__INPUTS.forEach((input, index) => {
    transactionBuilder.sign(index, keyPair)
  })
  return transactionBuilder.buildIncomplete()
}

const signAndBuildKeychain = async (transactionBuilder, unspents) => {
  const txRaw = transactionBuilder.buildIncomplete()
  unspents.forEach(({ scriptPubKey }, index) => txRaw.ins[index].script = Buffer.from(scriptPubKey, 'hex'))
  const keychain = await Keychain.create()
  const rawHex = await keychain.signTrx(
    txRaw.toHex(),
    localStorage.getItem(constants.privateKeyNames.btcKeychainPublicKey),
    'bitcoin'
  )
  return { ...txRaw, toHex: () => rawHex.result }
}

const fetchUnspents = (address) =>
  apiLooper.get('bitpay', `/addr/${address}/utxo`, { cacheResponse: 5000 })

const broadcastTx = (txRaw) =>
  apiLooper.post('bitpay', `/tx/send`, {
    body: {
      rawtx: txRaw,
    },
  })

const signMessage = (message, encodedPrivateKey) => {
  const keyPair = bitcoin.ECPair.fromWIF(encodedPrivateKey, [bitcoin.networks.bitcoin, bitcoin.networks.testnet])
  const privateKeyBuff = Buffer.from(keyPair.privateKey)

  const signature = bitcoinMessage.sign(message, privateKeyBuff, keyPair.compressed)

  return signature.toString('base64')
}

const getReputation = () =>  Promise.resolve(0)

export default {
  login,
  loginWithKeychain,
  getBalance,
  getTransaction,
  send,
  fetchUnspents,
  broadcastTx,
  fetchTx,
  fetchTxInfo,
  fetchBalance,
  signMessage,
  getReputation,
  getTx,
  getLinkToInfo,
  getInvoices,
  getWalletByWords,
  getRandomMnemonicWords,
  validateMnemonicWords,
}
