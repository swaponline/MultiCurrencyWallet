import BigInteger from 'bigi'

import config from 'app-config'
import bitcoin from 'bitcoinjs-lib'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import { btc, request, constants } from 'helpers'


const login = (privateKey) => {
  let keyPair

  if (privateKey) {
    const hash  = bitcoin.crypto.sha256(privateKey)
    const d     = BigInteger.fromBuffer(hash)

    keyPair     = new bitcoin.ECPair(d, null, { network: btc.network })
  }
  else {
    console.info('Created account Bitcoin ...')
    keyPair     = bitcoin.ECPair.makeRandom({ network: btc.network })
    privateKey  = keyPair.toWIF()
    localStorage.setItem(constants.privateKeyNames.btc, privateKey)
  }

  const account     = new bitcoin.ECPair.fromWIF(privateKey, btc.network) // eslint-disable-line
  const address     = account.getAddress()
  const publicKey   = account.getPublicKeyBuffer().toString('hex')

  const data = {
    account,
    keyPair,
    address,
    privateKey,
    publicKey,
  }

  window.getBtcAddress = () => data.address

  console.info('Logged in with Bitcoin', data)
  reducers.user.setAuthData({ name: 'btcData', data })
}

const getBalance = () => {
  const { user: { btcData: { address } } } = getState()

  return request.get(`${config.api.bitpay}/addr/${address}`)
    .then(({ balance }) => {
      console.log('BTC Balance:', balance)
      reducers.user.setBalance({ name: 'btcData', amount: balance })
      return balance
    }, () => Promise.reject())
}

const fetchBalance = (address) =>
  request.get(`${config.api.bitpay}/addr/${address}`)
    .then(({ balance, unconfirmedBalance }) => {
      console.log('BALANCE', balance)
      console.log('unconfirmedBalance', unconfirmedBalance)
      return balance
    })


const getTransaction = () =>
  new Promise((resolve) => {
    const { user: { btcData: { address } } } = getState()

    const url = `${config.api.bitpay}/txs/?address=${address}`
    let transactions

    request.get(url).then((res) => {
      if (res) {
        transactions = res.txs.map((item) => ({
          type: 'btc',
          hash: item.txid,
          confirmations: item.confirmations,
          value: item.vout[0].value,
          date: item.time * 1000,
          direction: address.toLocaleLowerCase() === item.vout[0].scriptPubKey.addresses[0].toLocaleLowerCase() ? 'in' : 'out',
        }))
        resolve(transactions)
      }
      else {
        resolve([])
        console.error('res:status BTC false', res)
      }
    })
  })


const send = (from, to, amount) =>
  new Promise((resolve, reject) => {
    const { user: { btcData: { privateKey } } } = getState()

    const newtx = {
      inputs: [
        {
          addresses: [ from ],
        },
      ],
      outputs: [
        {
          addresses: [ to ],
          value: amount * 100000000,
        },
      ],
    }
    request.post('https://api.blockcypher.com/v1/btc/test3/txs/new', {
      body: JSON.stringify(newtx),
    })
      .then((d) => {
        const tmptx = {
          ...d,
          pubkeys: [],
        }

        const keys = new bitcoin.ECPair.fromWIF(privateKey, btc.network) // eslint-disable-line

        tmptx.signatures = tmptx.tosign.map((toSign) => {
          tmptx.pubkeys.push(keys.getPublicKeyBuffer().toString('hex'))

          return keys.sign(BigInteger.fromHex(toSign.toString('hex')).toBuffer()).toDER().toString('hex')
        })

        return request.post('https://api.blockcypher.com/v1/btc/test3/txs/send', {
          body: JSON.stringify(tmptx),
        })
      })
      .then((res) => resolve(res)).catch((e) => console.log(e))
  })

const fetchUnspents = (address) =>
  request.get(`${config.api.bitpay}/addr/${address}/utxo`)

const broadcastTx = (txRaw) =>
  request.post(`${config.api.bitpay}/tx/send`, {
    body: {
      rawtx: txRaw,
    },
  })


export default {
  login,
  getBalance,
  getTransaction,
  send,
  fetchUnspents,
  broadcastTx,
  fetchBalance,
}
