import BigInteger from 'bigi'

import { BigNumber } from 'bignumber.js'
import bitcoin from 'bitcoinjs-lib'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import { ltc, request, constants, api } from 'helpers'


const login = (privateKey) => {
  let keyPair

  if (privateKey) {
    const hash  = bitcoin.crypto.sha256(privateKey)
    const d     = BigInteger.fromBuffer(hash)

    keyPair     = new bitcoin.ECPair(d, null, { network: ltc.network })
  }
  else {
    console.info('Created account Litecoin ...')
    keyPair     = bitcoin.ECPair.makeRandom({ network: ltc.network })
    privateKey  = keyPair.toWIF()
  }

  localStorage.setItem(constants.privateKeyNames.ltc, privateKey)

  const account     = new bitcoin.ECPair.fromWIF(privateKey, ltc.network) // eslint-disable-line
  const address     = account.getAddress()
  const publicKey   = account.getPublicKeyBuffer().toString('hex')

  const data = {
    account,
    keyPair,
    address,
    privateKey,
    publicKey,
  }

  window.getLtcAddress = () => data.address

  console.info('Logged in with Litecoin', data)
  reducers.user.setAuthData({ name: 'ltcData', data })
}

const getBalance = () => {
  const { user: { ltcData: { address } } } = getState()

  return request.get(`${api.getApiServer('ltc')}/addr/${address}`)
    .then(({ balance, unconfirmedBalance }) => {
      console.log('LTC Balance: ', balance)
      console.log('LTC unconfirmedBalance Balance: ', unconfirmedBalance)
      reducers.user.setBalance({ name: 'ltcData', amount: balance, unconfirmedBalance })
      return balance
    })
    .catch(() => {
      reducers.user.setBalanceError({ name: 'ltcData' })
    })
}

const fetchBalance = (address) =>
  request.get(`${api.getApiServer('ltc')}/addr/${address}`)
    .then(({ balance }) => balance)

const fetchTx = (hash) =>
  request.get(`${api.getApiServer('ltc')}/tx/${hash}`)

const getTransaction = () =>
  new Promise((resolve) => {
    const { user: { ltcData: { address } } } = getState()

    const url = `${api.getApiServer('ltc')}/txs/?address=${address}`

    function getValue(item) {
      if (item.vin.filter(item => item.addr === address).length
          === item.vin.length
          && item.vout.filter(item => item.scriptPubKey.addresses[0] === address).length
          === item.vout.length) {
        return (parseFloat(item.valueIn) - parseFloat(item.valueOut)).toFixed(8)
      } else {
        return item.vin.filter(item => item.addr === address).length > 0
          ? item.vout.filter(item => item.scriptPubKey.addresses[0] !== address)
            .reduce((sum, current) =>  sum + parseFloat(current.value), 0)
          : item.vout.filter(item => item.scriptPubKey.addresses[0] === address)
            .reduce((sum, current) =>  sum + parseFloat(current.value), 0)
      }
    }

    return request.get(url)
      .then((res) => {
        const transactions = res.txs.map((item) => ({
          type: 'ltc',
          hash: item.txid,
          confirmations: item.confirmations,
          value: getValue(item),
          date: item.time * 1000,
          direction: item.vin.filter(item => item.addr === address).length > 0  ? 'out' : 'in',
        }))
        resolve(transactions)
      })
      .catch(() => {
        resolve([])
      })
  })

const send = async ({ from, to, amount, feeValue, speed } = {}) => {
  const { user: { ltcData: { privateKey } } } = getState()
  const keyPair = bitcoin.ECPair.fromWIF(privateKey, ltc.network)

  feeValue = feeValue || await ltc.estimateFeeValue({ satoshi: true, speed })

  const tx            = new bitcoin.TransactionBuilder(ltc.network)
  const unspents      = await fetchUnspents(from)

  const fundValue     = new BigNumber(String(amount)).multipliedBy(1e8).integerValue().toNumber()
  const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
  const skipValue     = totalUnspent - feeValue - fundValue

  unspents.forEach(({ txid, vout }) => tx.addInput(txid, vout, 0xfffffffe))
  tx.addOutput(to, fundValue)
  tx.addOutput(from, skipValue)

  tx.inputs.forEach((input, index) => {
    tx.sign(index, keyPair)
  })

  const txRaw = tx.buildIncomplete()

  broadcastTx(txRaw.toHex())
}

const fetchUnspents = (address) =>
  request.get(`${api.getApiServer('ltc')}/addr/${address}/utxo`)

const broadcastTx = (txRaw) =>
  request.post(`${api.getApiServer('ltc')}/tx/send`, {
    body: {
      rawtx: txRaw,
    },
  })

export default {
  login,
  getBalance,
  fetchTx,
  getTransaction,
  send,
  fetchUnspents,
  broadcastTx,
  fetchBalance,
}
