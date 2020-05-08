import BigInteger from 'bigi'

import { BigNumber } from 'bignumber.js'
import * as bitcoin from 'bitcoinjs-lib'
import bitcoinMessage from 'bitcoinjs-message'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import { ltc, apiLooper, constants, api } from 'helpers'


const login = (privateKey) => {
  let keyPair

  if (privateKey) {
    const hash  = bitcoin.crypto.sha256(privateKey)
    const d     = BigInteger.fromBuffer(hash)
    
    keyPair     = bitcoin.ECPair.fromWIF(privateKey, ltc.network)
  }
  else {
    console.info('Created account Litecoin ...')
    keyPair     = bitcoin.ECPair.makeRandom({ network: ltc.network })
    privateKey  = keyPair.toWIF()
  }

  localStorage.setItem(constants.privateKeyNames.ltc, privateKey)

  const account       = bitcoin.ECPair.fromWIF(privateKey, ltc.network) // eslint-disable-line
  const { publicKey } = account
  const { address }   = bitcoin.payments.p2pkh({
    pubkey: account.publicKey,
    network: ltc.network,
  })

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

  return apiLooper.get('ltc', `/addr/${address}`)
    .then(({ balance, unconfirmedBalance }) => {
      console.log('LTC Balance: ', balance)
      console.log('LTC unconfirmedBalance Balance: ', unconfirmedBalance)
      reducers.user.setBalance({ name: 'ltcData', amount: balance, unconfirmedBalance })
      return balance
    })
    .catch((e) => {
      reducers.user.setBalanceError({ name: 'ltcData' })
    })
}

const fetchBalance = (address) =>
  apiLooper.get('ltc', `/addr/${address}`)
    .then(({ balance }) => balance)

const fetchTx = (hash) =>
  apiLooper.get('ltc', `/tx/${hash}`)
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

const getTransaction = (address) =>
  new Promise((resolve) => {
    const { user: { ltcData: { address: userAddress } } } = getState()
    address = address || userAddress
   
    const url = `/txs/?address=${address}`
    function getValue(item) {
      if (item.vin.filter(item => item.addr === address).length
          === item.vin.length
          && item.vout.filter(item => item.scriptPubKey.addresses[0] === address).length
          === item.vout.length) {
        return (parseFloat(item.valueIn) - parseFloat(item.valueOut)).toFixed(8)  // eslint-disable-next-line
      } else {
        return item.vin.filter(item => item.addr === address).length > 0
          ? item.vout.filter(item => item.scriptPubKey.addresses[0] !== address)
            .reduce((sum, current) =>  sum + parseFloat(current.value), 0)
          : item.vout.filter(item => item.scriptPubKey.addresses[0] === address)
            .reduce((sum, current) =>  sum + parseFloat(current.value), 0)
      }
    }

    return apiLooper.get('ltc', url)
      .then((res) => {
        const transactions = res.txs.map((item) => {
          const direction = item.vin[0].addr !== address ? 'in' : 'out'
          const isSelf = direction === 'out'
            && item.vout.filter((item) =>
              item.scriptPubKey.addresses[0] === address
            ).length === item.vout.length

          return ({
            type: 'ltc',
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

const getTx = (txRaw) => {

  return txRaw.transactionHash
}

const getLinkToInfo = (tx) => {

  if(!tx) {
    return
  }

  return `https://etherscan.io/tx/${tx}`
}

const send = async ({ from, to, amount, feeValue, speed } = {}) => {
  const { user: { ltcData: { privateKey } } } = getState()
  const keyPair = bitcoin.ECPair.fromWIF(privateKey, ltc.network)

  feeValue = feeValue || await ltc.estimateFeeValue({ inSatoshis: true, speed })

  const tx            = new bitcoin.TransactionBuilder(ltc.network)
  const unspents      = await fetchUnspents(from)

  const fundValue     = new BigNumber(String(amount)).multipliedBy(1e8).integerValue().toNumber()
  const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
  const skipValue     = totalUnspent - fundValue - feeValue

  unspents.forEach(({ txid, vout }) => tx.addInput(txid, vout, 0xfffffffe))
  tx.addOutput(to, fundValue)

  if (skipValue > 546) {
    tx.addOutput(from, skipValue)
  }

  tx.inputs.forEach((input, index) => {
    tx.sign(index, keyPair)
  })

  const txRaw = tx.buildIncomplete()

  await broadcastTx(txRaw.toHex())

  return txRaw
}

const fetchUnspents = (address) =>
  apiLooper.get('ltc', `/addr/${address}/utxo`)

const broadcastTx = (txRaw) =>
  apiLooper.post('ltc', `/tx/send`, {
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

const getReputation = () => Promise.resolve(0)

export default {
  login,
  getBalance,
  getTransaction,
  send,
  fetchUnspents,
  broadcastTx,
  fetchTx,
  getTx,
  getLinkToInfo,
  fetchTxInfo,
  fetchBalance,
  signMessage,
  getReputation
}
