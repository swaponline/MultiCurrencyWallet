const bitcoin = require('bitcoinjs-lib')
const bitcoinMessage = require('bitcoinjs-message')
const config = require("./config.js")
const request = require('superagent')


let _account_mainnet = null
let _account_testnet = null

const login = (privateKeyMainnet, privateKeyTestnet) => {
  _account_mainnet = bitcoin.ECPair.fromWIF(privateKeyMainnet, bitcoin.networks.mainnet)
  _account_testnet = bitcoin.ECPair.fromWIF(privateKeyTestnet, bitcoin.networks.testnet)
  console.log('Logged to bitcoin')
  console.log('Testnet:')
  console.log(bitcoin.payments.p2pkh({ pubkey: _account_testnet.publicKey, network: bitcoin.networks.testnet }).address)
  console.log(_account_testnet.publicKey.toString('hex'))
  console.log('Mainnet:')
  console.log(bitcoin.payments.p2pkh({ pubkey: _account_mainnet.publicKey, network: bitcoin.networks.mainnet }).address)
  console.log(_account_mainnet.publicKey.toString('hex'))
}

const CheckPublicKey = (walletAddress, publicKey, checkSign, mainnet) => {
  return true
  console.log(checkSign)
  const signature = Buffer.from(checkSign, 'base64')
  const message = `${walletAddress}:${publicKey}`
  console.log(message)
  console.log(signature.toString('base64'))
  return bitcoinMessage.verify(message, walletAddress, signature)
}

const SignTXv5 = async (publicKey, txHash, mainnet) => {
  console.log('SignTXv5', publicKey, txHash)
  const network = (mainnet) ? bitcoin.networks.mainnet : bitcoin.networks.testnet
  const privateKey = (mainnet) ? config.privateKey.mainnet : config.privateKey.testnet

  const psbt = bitcoin.Psbt.fromHex(txHash)

  psbt.signAllInputs(bitcoin.ECPair.fromWIF(privateKey, network))
  psbt.finalizeAllInputs();

  const rawTx = psbt.extractTransaction().toHex()

  return rawTx
}

const SignTXv4 = async (publicKey, txHash, mainnet) => {
  console.log('SignTX', publicKey, txHash)
  const account = (mainnet) ? _account_mainnet : _account_testnet
  const network = (mainnet) ? bitcoin.networks.mainnet : bitcoin.networks.testnet
  const privateKey = (mainnet) ? config.privateKey.mainnet : config.privateKey.testnet

  let publicKeys = JSON.parse(publicKey)
  //publicKeys.unshift( account.publicKey.toString('Hex') )

  console.log('PublicKeys raw', publicKeys)
  publicKeys = publicKeys.map( (key) => Buffer.from(key, 'Hex') )
  console.log('pk',publicKeys)
  
  let txb = bitcoin.TransactionBuilder.fromTransaction(
    bitcoin.Transaction.fromHex(txHash),
    (mainnet) ? bitcoin.networks.mainnet : bitcoin.networks.testnet
  );

  const p2ms = bitcoin.payments.p2ms({
    m: 2,
    n: publicKeys.length,
    pubkeys: publicKeys,
    network
  })

  const p2sh = bitcoin.payments.p2sh({ redeem: p2ms, network })

  txb.__INPUTS.forEach((input, index) => {
    txb.sign(index, bitcoin.ECPair.fromWIF(privateKey, network), p2sh.redeem.output)
  })

  let tx = await txb.build()
  
  return tx.toHex()
}

const broadcast = (txRaw, mainnet) => {
  const api = (mainnet) ? config.api.mainnet : config.api.testnet
  request.post(`${api}/tx/send`, {
    body: {
      rawtx: txRaw,
    },
  })
}

module.exports = {
  login,
  CheckPublicKey,
  SignTXv4,
  SignTXv5,
  broadcast,
}