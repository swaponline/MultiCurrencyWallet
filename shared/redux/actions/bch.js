import BigInteger from 'bigi'

import { BigNumber } from 'bignumber.js'
import bitcoinMessage from 'bitcoinjs-message'
import bitcoincash from 'bitcoincashjs-lib'
import bchaddr from 'bchaddrjs'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import { bch, apiLooper, constants, api } from 'helpers'
import { Keychain } from 'keychain.js'
import actions from 'redux/actions'


const login = (privateKey) => {
  let keyPair

  if (privateKey) {
    const hash  = bitcoincash.crypto.sha256(privateKey)
    const d     = BigInteger.fromBuffer(hash)

    keyPair     = new bitcoincash.ECPair(d, null, { network: bch.network })
  }
  else {
    console.info('Created account Bitcoin Cash ...')
    keyPair     = bitcoincash.ECPair.makeRandom({ network:bch.network })
    privateKey  = keyPair.toWIF()
  }

  localStorage.setItem(constants.privateKeyNames.bch, privateKey)

  const account     = new bitcoincash.ECPair.fromWIF(privateKey, bch.network) // eslint-disable-line
  const address     = bchaddr.toCashAddress(account.getAddress())
  const publicKey   = account.getPublicKeyBuffer().toString('hex')

  const data = {
    account,
    keyPair,
    address,
    currency: 'BCH',
    fullName: 'BitcoinCash',
    privateKey,
    publicKey,
  }

  window.getBchAddress = () => data.address

  console.info('Logged in with Bitcoin Cash', data)
  reducers.user.setAuthData({ name: 'bchData', data })
}

const getBalance = () => {
  const { user: { bchData: { address } } } = getState()

  return apiLooper.get('bch', `/address/details/${address}`)
    .then(({ balance, unconfirmedBalance }) => {
      console.log('BCH Balance: ', balance)
      console.log('BCH unconfirmedBalance Balance: ', unconfirmedBalance)
      reducers.user.setBalance({ name: 'bchData', amount: balance, unconfirmedBalance })
      return balance
    })
    .catch((e) => {
      reducers.user.setBalanceError({ name: 'bchData' })
    })
}

const fetchBalance = (address) =>
  apiLooper.get('bch', `/address/details/${address}`)
    .then(({ balance }) => balance)

const fetchTx = (hash) =>
  apiLooper.get('bch', `/transaction/details/${hash}`)
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

const getTransaction = () =>
  new Promise((resolve) => {
    const { user: { bchData: { address } } } = getState()

    const url = `/address/transactions/${address}`
    const legacyAddress = bchaddr.toLegacyAddress(address)

    return apiLooper.get('bch', url)
      .then((res) => {
        const transactions = res.txs.map((item) => {
          console.warn('item', item)
          const direction = item.vin[0].addr !== legacyAddress ? 'in' : 'out'
          const isSelf = direction === 'out'
            && item.vout.filter((item) =>
              item.scriptPubKey.addresses[0] === legacyAddress
            ).length === item.vout.length
          const value = isSelf
            ? item.fees
            : item.vout.filter((item) => {
              const currentAddress = item.scriptPubKey.addresses[0]

              return direction === 'in'
                ? (currentAddress === legacyAddress)
                : (currentAddress !== legacyAddress)
            })[0].value

          console.warn('direction', direction)
          console.warn('isSelf', isSelf)
          console.warn('value', value)

          return ({
            type: 'bch',
            hash: item.txid,
            confirmations: item.confirmations,
            value,
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
  feeValue = feeValue || await bch.estimateFeeValue({ inSatoshis: true, speed })

  const tx            = new bitcoincash.TransactionBuilder(bch.network)
  const unspents      = await fetchUnspents(from)

  const fundValue     = new BigNumber(String(amount)).multipliedBy(1e8).integerValue().toNumber()
  const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
  const skipValue     = totalUnspent - fundValue - feeValue

  unspents.forEach(({ txid, vout }) => tx.addInput(txid, vout, 0xffffffff))
  tx.addOutput(bchaddr.toLegacyAddress(to), fundValue)

  if (skipValue > 546) {
    tx.addOutput(bchaddr.toLegacyAddress(from), skipValue)
  }

  const txRaw = signAndBuild(tx, unspents)

  await broadcastTx(txRaw.toHex())

  return txRaw
}

const signAndBuild = (transactionBuilder, unspents) => {
  const { user: { bchData: { privateKey } } } = getState()
  const keyPair = bitcoincash.ECPair.fromWIF(privateKey, bch.network)

  transactionBuilder.inputs.forEach((input, index) => {
    const amount = unspents[index].satoshis

    transactionBuilder.sign(
      index,
      keyPair,
      null,
      bitcoincash.Transaction.SIGHASH_ALL,
      amount,
    )
  })
  return transactionBuilder.build()
}

const fetchUnspents = (address) =>
  apiLooper.get('bch', `/address/utxo/${address}`, { cacheResponse: 5000 })
    .then(({ utxos }) => utxos)

const broadcastTx = (txRaw) =>
  apiLooper.post('bch', `/rawtransactions/sendRawTransaction`, {
    body: {
      hexes: [
        txRaw,
      ],
    },
  })

const signMessage = (message, encodedPrivateKey) => {
  const keyPair = bitcoincash.ECPair.fromWIF(encodedPrivateKey, bch.network)
  const privateKey = keyPair.d.toBuffer(32)

  const signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed)

  return signature.toString('base64')
}

const getReputation = () => Promise.resolve(0)

export default {
  login,
  getBalance,
  getTransaction,
  send,
  fetchUnspents,
  broadcastTx,
  fetchTx,
  fetchTxInfo,
  fetchBalance,
  signMessage,
  getReputation
}
