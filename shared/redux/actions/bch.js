import { BigNumber } from 'bignumber.js'
import bitcoincash from 'bitcore-lib-cash'
import bchaddr from 'bchaddrjs'
import bitcoinMessage from 'bitcoinjs-message'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import { bch, request, constants, api } from 'helpers'
import actions from 'redux/actions'


const login = (importedPrivateKey) => {
  const account = importedPrivateKey
    ? bitcoincash.PrivateKey.fromWIF(importedPrivateKey, bch.network)
    : new bitcoincash.PrivateKey(null, bch.network)

  const privateKey = account.toWIF()
  const publicKey = account.toPublicKey().toBuffer().toString('hex')
  const address = account.toAddress(bch.network).toCashAddress()

  const data = {
    account,
    address,
    privateKey,
    publicKey,
  }

  localStorage.setItem(constants.privateKeyNames.bch, privateKey)

  window.getBchAddress = () => data.address

  console.info('Logged in with BitcoinCash', data)

  reducers.user.setAuthData({ name: 'bchData', data })
}

const getBalance = () => {
  const { user: { bchData: { address } } } = getState()

  return request.get(`${api.getApiServer('bch')}/addr/${address}`)
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
  request.get(`${api.getApiServer('bch')}/addr/${address}`)
    .then(({ balance }) => balance)

const fetchTx = (hash) =>
  request.get(`${api.getApiServer('bch')}/tx/${hash}`)
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
    const cashAddress = address
    const cashAddressShort = address.split(':').slice(-1)[0]
    const legacyAddress = bchaddr.toLegacyAddress(address)
    const checkAddress = (addr) => addr === cashAddress
      || addr === cashAddressShort
      || addr === legacyAddress
    const url = `${api.getApiServer('bch')}/txs/?address=${address}`

    return request.get(url)
      .then((res) => {
        const transactions = res.txs.map((item) => {
          const direction = item.vin.filter((element) => checkAddress(element.addr)).length ? 'out' : 'in'
          const isSelf = direction === 'out'
            && item.vout.filter((item) =>
              checkAddress(item.scriptPubKey.addresses[0])
            ).length === item.vout.length
          const value = isSelf
            ? item.fees
            : item.vout.filter((item) => {
              const txAddress = item.scriptPubKey.addresses[0]
              const currentAddress = address.replace(':').slice(-1)[0]
              return direction === 'in'
                ? checkAddress(txAddress)
                : !checkAddress(txAddress)
            })[0].value

          return ({
            type: 'bch',
            hbchash: item.txid,
            confirmations: item.confirmations,
            value,
            date: item.time * 1000,
            direction: isSelf ? 'self' : direction,
          })
        })

        resolve(transactions)
      })
      .catch((error) => {
        console.error('getTransaction error:', error)

        resolve([])
      })
  })

const send = async ({ from, to, amount, feeValue, speed } = {}) => {
  const { user: { bchData: { privateKey } } } = getState()

  const toInlegacyAddress = bchaddr.toLegacyAddress(to)
  const minFees = 546
  const tx = new bitcoincash.Transaction()
  const unspents = await fetchUnspents(from)

  const fees = Number(feeValue || await bch.estimateFeeValue({ inSatoshis: true, speed }))
  const fundValue = BigNumber(amount).multipliedBy(1e8).integerValue().toNumber()
  const totalUnspent = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
  const skipValue = totalUnspent - fundValue - fees

  if (fees < minFees) {
    throw new Error(`Not enough fees: ${fees} less than ${minFees}`)
  }

  if (skipValue < 0) {
    throw new Error(`Not enough balance: ${skipValue}`)
  }

  unspents.forEach(({ address, ...data }) => tx.from(data)) // Don't put address. You get error if it has legacy format

  tx.to(toInlegacyAddress, fundValue)
    .fee(fees)
    .change(from)
    .sign(privateKey)

  const txRaw = tx.toString(16)

  await broadcastTx(txRaw)

  return txRaw
}

const signAndBuild = (transactionBuilder) => {
  const keyPair = bitcoin.ECPair.fromWIF(privateKey, bch.network)

  transactionBuilder.inputs.forEach((input, index) => {
    transactionBuilder.sign(index, keyPair)
  })
  return transactionBuilder.buildIncomplete()
}

const fetchUnspents = (address) =>
  request.get(`${api.getApiServer('bch')}/addr/${address}/utxo`, { cacheResponse: 5000 })

const broadcastTx = (txRaw) =>
  request.post(`${api.getApiServer('bch')}/tx/send`, {
    body: {
      rawtx: txRaw,
    },
  })

const signMessage = (message, encodedPrivateKey) => {
  const keyPair = bitcoin.ECPair.fromWIF(encodedPrivateKey, [bitcoin.networks.bitcoin, bitcoin.networks.testnet])
  const privateKey = keyPair.d.toBuffer(32)

  const signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed)

  return signature.toString('base64')
}

const getReputation = () =>
  new Promise(async (resolve, reject) => {
    const { user: { bchData: { address, privateKey } } } = getState()
    const addressOwnerSignature = signMessage(address, privateKey)

    request.post(`${api.getApiServer('swapsExplorer')}/reputation`, {
      json: true,
      body: {
        address,
        addressOwnerSignature,
      },
    }).then((response) => {
      const { reputation, reputationOracleSignature } = response

      reducers.user.setReputation({ name: 'bchData', reputation, reputationOracleSignature })
      resolve(reputation)
    }).catch((error) => {
      reject(error)
    })
  })

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
  getReputation,
}
