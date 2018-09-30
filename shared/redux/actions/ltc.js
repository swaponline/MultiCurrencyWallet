import BigInteger from 'bigi'

import { BigNumber } from 'bignumber.js'
import bitcoin from 'bitcoinjs-lib'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import { ltc, request, constants, api } from 'helpers'


const network = process.env.MAINNET ? 'LTC' : 'LTCTEST'

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

  console.info('Logged in with Litecoin', data)
  reducers.user.setAuthData({ name: 'ltcData', data })
}

const getBalance = () => {
  const { user: { ltcData: { address } } } = getState()
  const url = `${api.getApiServer('ltc')}/address/${network}/${address}`

  return request.get(url)
    .then(({ data }) => {
      let balance = data.balance
      reducers.user.setBalance({ name: 'ltcData', amount: balance })
      return balance
    }, () => Promise.reject())
}

const getTransaction = () =>
  new Promise((resolve) => {
    const { user: { ltcData: { address } } } = getState()

    const url = `${api.getApiServer('ltc')}/address/${network}/${address}`

    return request.get(url)
      .then((res) => {
        const transactions = res.data.txs.map((item) => ({
          type: 'ltc',
          hash: item.txid,
          confirmations: item.confirmations,
          value: item.outgoing != undefined ? item.outgoing.outputs[0].value : item.incoming.value,
          date: item.time * 1000,
          direction: item.outgoing != undefined ? 'out' : 'in',
        }))
        resolve(transactions)
      })
      .catch(() => {
        resolve([])
      })
  })

const send = async (from, to, amount) => {
  const { user: { ltcData: { privateKey } } } = getState()
  const keyPair = bitcoin.ECPair.fromWIF(privateKey, ltc.network)

  const tx            = new bitcoin.TransactionBuilder(ltc.network)
  const unspentsData  = await fetchUnspents(from)
  const unspents      = unspentsData.data.txs

  const fundValue     = new BigNumber(String(amount)).multipliedBy(1e8).integerValue().toNumber()
  const feeValue      = 100000
  const totalUnspent  = unspents.reduce((summ, { value }) => summ + (parseInt(value) * 100000000), 0)
  const skipValue     = totalUnspent - feeValue - fundValue

  unspents.forEach(({ txid, output_no }) => tx.addInput(txid, output_no, 0xfffffffe))
  tx.addOutput(to, fundValue)
  tx.addOutput(from, skipValue)

  tx.inputs.forEach((input, index) => {
    tx.sign(index, keyPair)
  })

  const txRaw = tx.buildIncomplete()

  broadcastTx(txRaw.toHex())
}

const fetchUnspents = (address) =>
  request.get(`${api.getApiServer('ltc')}/get_tx_unspent/${network}/${address}`)

const broadcastTx = (txHex) =>
  request.post(`${api.getApiServer('ltc')}/send_tx/${network}`, {
    body: {
      tx_hex: txHex,
    },
  })

export default {
  login,
  getBalance,
  send,
  getTransaction,
  broadcastTx,
  fetchUnspents,
}
