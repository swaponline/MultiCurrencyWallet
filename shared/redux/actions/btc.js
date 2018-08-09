import BigInteger from 'bigi'

import config from 'app-config'
import bitcoin from 'bitcoinjs-lib'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import { btc, request, constants, api } from 'helpers'


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
  }

  localStorage.setItem(constants.privateKeyNames.btc, privateKey)

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

  return request.get(`${api.getApiServer('bitpay')}/addr/${address}`)
    .then(({ balance, unconfirmedBalance }) => {
      console.log('BTC Balance:', balance)
      console.log('BTC unconfirmedBalance Balance:', unconfirmedBalance)
      reducers.user.setBalance({ name: 'btcData', amount: balance, unconfirmedBalance })
      return balance
    }, () => Promise.reject())
}

const fetchBalance = (address) =>
  request.get(`${api.getApiServer('bitpay')}/addr/${address}`)
    .then(({ balance, unconfirmedBalance }) => {
      console.log('BALANCE', balance)
      console.log('unconfirmedBalance', unconfirmedBalance)
      return balance
    })


const getTransaction = () =>
  new Promise((resolve) => {
    const { user: { btcData: { address } } } = getState()

    const url = `${api.getApiServer('bitpay')}/txs/?address=${address}`

    return request.get(url)
      .then((res) => {
        const transactions = res.txs.map((item) => ({
          type: 'btc',
          hash: item.txid,
          confirmations: item.confirmations,
          value: item.vout[0].value,
          date: item.time * 1000,
          direction: address.toLocaleLowerCase() === item.vout[0].scriptPubKey.addresses[0].toLocaleLowerCase() ? 'in' : 'out',
        }))
        resolve(transactions)
      })
      .catch(() => {
        resolve([])
      })
  })

const createScript = (data) => {
  const { secretHash, ownerPublicKey, recipientPublicKey, lockTime } = data

  const network = (
    process.env.MAINNET
      ? bitcoin.networks.bitcoin
      : bitcoin.networks.testnet
  )

  const script = bitcoin.script.compile([

    bitcoin.opcodes.OP_RIPEMD160,
    Buffer.from(secretHash, 'hex'),
    bitcoin.opcodes.OP_EQUALVERIFY,

    Buffer.from(recipientPublicKey, 'hex'),
    bitcoin.opcodes.OP_EQUAL,
    bitcoin.opcodes.OP_IF,

    Buffer.from(recipientPublicKey, 'hex'),
    bitcoin.opcodes.OP_CHECKSIG,

    bitcoin.opcodes.OP_ELSE,

    bitcoin.script.number.encode(lockTime),
    bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
    bitcoin.opcodes.OP_DROP,
    Buffer.from(ownerPublicKey, 'hex'),
    bitcoin.opcodes.OP_CHECKSIG,

    bitcoin.opcodes.OP_ENDIF,
  ])

  const scriptPubKey  = bitcoin.script.scriptHash.output.encode(bitcoin.crypto.hash160(script))
  const scriptAddress = bitcoin.address.fromOutputScript(scriptPubKey, network)

  return {
    scriptAddress,
  }
}


const send = async (from, to, amount) => {

  const tx            = new bitcoin.TransactionBuilder(this.network)
  const unspents      = await this.fetchUnspents(from)
  const feeValue      = 15000
  const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)

  unspents.forEach(({ txid, vout }) => tx.addInput(txid, vout, 0xfffffffe))
  tx.addOutput(to, totalUnspent - feeValue)

  const txRaw = tx.buildIncomplete()

}

const signTransaction = (data) => {
  const { user: { btcData :{ account } } } = getState()
  const { script, txRaw, secret } = data

  const hashType      = bitcoin.Transaction.SIGHASH_ALL
  const signatureHash = txRaw.hashForSignature(0, script, hashType)
  const signature     = account.btc.sign(signatureHash).toScriptSignature(hashType)

  const scriptSig = bitcoin.script.scriptHash.input.encode(
    [
      signature,
      account.btc.getPublicKeyBuffer(),
      Buffer.from(secret.replace(/^0x/, ''), 'hex'),
    ],
    script,
  )

  txRaw.setInputScript(0, scriptSig)
}

const fetchUnspents = (address) =>
  request.get(`${api.getApiServer('bitpay')}/addr/${address}/utxo`)

const broadcastTx = (txRaw) =>
  request.post(`${api.getApiServer('bitpay')}/tx/send`, {
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
  createScript,
  broadcastTx,
  fetchBalance,
}
