import BigInteger from 'bigi'

import { BigNumber } from 'bignumber.js'
import * as bitcoin from 'bitcoinjs-lib'
import bitcoinMessage from 'bitcoinjs-message'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import { btc, apiLooper, constants, api } from 'helpers'
import { Keychain } from 'keychain.js'
import actions from 'redux/actions'

window.bitcoinjs = bitcoin

const login = (privateKey) => {
  let keyPair

  if (privateKey) {
    const hash  = bitcoin.crypto.sha256(privateKey)
    const d     = BigInteger.fromBuffer(hash)

    keyPair     = bitcoin.ECPair.fromWIF(privateKey, btc.network)
  }
  else {
    console.info('Created account Bitcoin ...')
    keyPair     = bitcoin.ECPair.makeRandom({ network: btc.network })
    privateKey  = keyPair.toWIF()
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

const getBalance = () => {
  const { user: { btcData: { address } } } = getState()

  return apiLooper.get('bitpay', `/addr/${address}`)
    .then(({ balance, unconfirmedBalance }) => {
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
  apiLooper.get('bitpay', `/addr/${address}`)
    .then(({ balance }) => balance)

const fetchTx = (hash) =>
  apiLooper.get('bitpay', `/tx/${hash}`)
    .then(({ fees, ...rest }) => ({
      fees: BigNumber(fees).multipliedBy(1e8),
      ...rest,
    }))

const fetchTxInfo = (hash) =>
  fetchTx(hash)
    .then(({ vin, ...rest }) => ({
      senderAddress: vin ? vin[0].addr : null,
      ...rest,
    }))

const getInvoices = () => {
  const { user: { btcData: { address } } } = getState()

  return actions.invoices.getInvoices({
    currency: 'BTC',
    address,
  })
}
const getTransaction = () =>
  new Promise((resolve) => {
    const { user: { btcData: { address } } } = getState()

    const url = `/txs/?address=${address}`

    return apiLooper.get('bitpay', url)
      .then((res) => {
        const transactions = res.txs.map((item) => {
          const direction = item.vin[0].addr !== address ? 'in' : 'out'
          const isSelf = direction === 'out'
            && item.vout.filter((item) =>
              item.scriptPubKey.addresses[0] === address
            ).length === item.vout.length

          return ({
            type: 'btc',
            hash: item.txid,
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

const getReputation = () =>
  new Promise(async (resolve, reject) => {
    const { user: { btcData: { address, privateKey } } } = getState()
    const addressOwnerSignature = signMessage(address, privateKey)

    apiLooper.post('swapsExplorer', `/reputation`, {
      json: true,
      body: {
        address,
        addressOwnerSignature,
      },
    }).then((response) => {
      const { reputation, reputationOracleSignature } = response

      reducers.user.setReputation({ name: 'btcData', reputation, reputationOracleSignature })
      resolve(reputation)
    }).catch((error) => {
      reject(error)
    })
  })

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
  getInvoices,
}
