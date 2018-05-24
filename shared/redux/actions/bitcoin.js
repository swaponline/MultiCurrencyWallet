import BigInteger from 'bigi'
import { config, request } from 'helpers'
import bitcoin from 'bitcoinjs-lib'
import reducers from 'redux/core/reducers'


export const login = (privateKey) => {
  let keyPair

  if (privateKey) {
    const hash  = bitcoin.crypto.sha256(privateKey)
    const d     = BigInteger.fromBuffer(hash)

    keyPair     = new bitcoin.ECPair(d, null, { network: bitcoin.networks.testnet })
  }
  else {
    console.info('Created account Bitcoin ...')
    keyPair     = bitcoin.ECPair.makeRandom({ network: bitcoin.networks.testnet })
    privateKey  = keyPair.toWIF()
  }

  const address     = keyPair.getAddress()
  const account     = new bitcoin.ECPair.fromWIF(privateKey, bitcoin.networks.testnet) // eslint-disable-line
  const publicKey   = account.getPublicKeyBuffer().toString('hex')

  const data = {
    account,
    keyPair,
    address,
    privateKey,
    publicKey,
  }

  console.info('Logged in with Bitcoin', data)
  reducers.user.setAuthData({ name: 'btcData', data })
}

export const getBalance = (address) =>
  request.get(`https://test-insight.bitpay.com/api/addr/${address}`)
    .then(({ balance: amount }) => {
      console.log('BTC Balance:', amount)
      reducers.user.setBalance({ name: 'btcData', amount })
    })

export const getTransaction = (address) =>
  new Promise((resolve) => {

    const url = `${config.api.blocktrail}/address/${address}/transactions?api_key=${config.apiKeys.blocktrail}`
    let transactions

    request.get(url).then((res) => {
      if (res.total) {
        transactions = res.data.map((item) => ({
          type: 'btc',
          status: item.block_hash != null ? 1 : 0,
          value: item.outputs[0].value / 1e8,
          address: item.outputs[0].address,
          date: new Date(Date.parse(item.time)).toLocaleString('en-US',  config.date),
          direction: address.toLocaleLowerCase() === item.outputs[0].address.toLocaleLowerCase() ? 'in' : 'out',
        }))
        resolve(transactions)
      }
      else {
        console.error('res:status BTC false', res)
      }
    })
  })

export const send = (from, to, amount, keyPair) =>
  new Promise((resolve, reject) => {
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
    console.log('Начало перевода ....')
    request.post('https://api.blockcypher.com/v1/btc/test3/txs/new', {
      body: JSON.stringify(newtx),
    }).then((d) => {
      console.log('Перевод завершен')

      let tmptx = d

      tmptx.pubkeys = []

      let keys = new bitcoin.ECPair.fromWIF(keyPair.toWIF(), bitcoin.networks.testnet) // eslint-disable-line

      tmptx.signatures = tmptx.tosign.map((tosign, n) => {
        tmptx.pubkeys.push(keys.getPublicKeyBuffer().toString('hex'))

        return keys.sign(BigInteger.fromHex(tosign.toString('hex')).toBuffer()).toDER().toString('hex')
      })

      return request.post('https://api.blockcypher.com/v1/btc/test3/txs/send', {
        body: JSON.stringify(tmptx),
      })
    })
      .then((res) => resolve(res)).catch((e) => console.log(e))
  })

export const fetchUnspents = (address) =>
  request.get(`https://test-insight.bitpay.com/api/addr/${address}/utxo`)

export const broadcastTx = (txRaw) =>
  request.post(`https://test-insight.bitpay.com/api/tx/send`, {
    body: {
      rawtx: txRaw,
    },
  })
