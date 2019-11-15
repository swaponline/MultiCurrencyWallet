import BigInteger from 'bigi'

import { BigNumber } from 'bignumber.js'
import * as bitcoin from 'bitcoinjs-lib'
import bitcoinMessage from 'bitcoinjs-message'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import { request, constants, api } from 'helpers'
import btc from 'helpers/btc'
import { Keychain } from 'keychain.js'
import actions from 'redux/actions'

const protectSMSAPI = 'https://2fa.swaponline.site'

const addWallet = (otherOwnerPublicKey) => {
  const { user: { btcMultisigSMSData: { address, privateKey } } } = getState()
  createWallet(privateKey, otherOwnerPublicKey)
}
window.MS_addWallet = addWallet

const checkSMSActivated = () => {
  const { user: { btcMultisigSMSData : { isRegistered } } } = getState()
  return isRegistered
}

const checkG2FAActivated = () => {
  return false
}

const checkUserActivated = () => {
  const { user: { btcMultisigUserData : { active } } } = getState()
  return active
}

const createWallet = (privateKey, otherOwnerPublicKey) => {
  // privateKey - key of our privary one-sign btc wallet
  let keyPair

  if (privateKey) {
    const hash  = bitcoin.crypto.sha256(privateKey)
    const d     = BigInteger.fromBuffer(hash)

    keyPair     = bitcoin.ECPair.fromWIF(privateKey, btc.network)
  }
  else {
    console.error('Requery privateKey')
    return false
  }

  
  const account       = bitcoin.ECPair.fromWIF(privateKey, btc.network) // eslint-disable-line
  const { addressOfMyOwnWallet }   = bitcoin.payments.p2wpkh({ pubkey: account.publicKey, network: btc.network })
  const { publicKey } = account
  
  const publicKeysRaw = [ otherOwnerPublicKey,  account.publicKey.toString('hex') ].sort().reverse()
  
  const publicKeys = publicKeysRaw.map(hex => Buffer.from(hex, 'hex'))
  
  const p2ms = bitcoin.payments.p2ms({
    m: 2,
    n: 2,
    pubkeys: publicKeys,
    network: btc.network,
  })
  const p2sh = bitcoin.payments.p2sh({ redeem: p2ms, network: btc.network })
  
  const { address } = p2sh
  

  const data = {
    account,
    keyPair,
    address,
    addressOfMyOwnWallet,
    currency: 'BTC (Multisig)',
    fullName: 'Bitcoin (Multisig)',
    privateKey,
    publicKeys,
    publicKey,
  }

  localStorage.setItem(constants.privateKeyNames.btcMultisigOtherOwnerKey, otherOwnerPublicKey)

  
  window.getBtcMultisigData = () => data
  window.getBtcMultisigAddress = () => data.address

  console.info('Logged in with BitcoinMultisig', data)
  reducers.user.setAuthData({ name: 'btcMultisigData', data })
}
window.MS_CreateWallet = createWallet

const login_SMS = (privateKey, otherOwnerPublicKey) => {
  const data = login_(privateKey, otherOwnerPublicKey, false)

  const isRegistered = (localStorage.getItem(`${constants.localStorage.didProtectedBtcCreated}:${data.address}`) === '1')

  data.currency = 'BTC (SMS-Protected)'
  data.fullName = 'Bitcoin (SMS-Protected)'
  data.isRegistered = isRegistered
  data.isSmsProtected = true

  reducers.user.setAuthData({ name: 'btcMultisigSMSData', data })
}

const login_G2FA = (privateKey, otherOwnerPublicKey) => {
  const data = login_(privateKey, otherOwnerPublicKey, false)

  const isRegistered = (localStorage.getItem(`${constants.localStorage.didProtectedBtcG2FACreated}:${data.address}`) === '1')
  
  data.currency = 'BTC (Google 2FA)'
  data.fullName = 'Bitcoin (Google 2FA)'
  data.isRegistered = isRegistered
  data.isG2FAProtected = true

  reducers.user.setAuthData({ name: 'btcMultisigG2FAData', data })
}

const login_USER = (privateKey, otherOwnerPublicKey ,onlyCheck) => {
  const data = login_(privateKey, otherOwnerPublicKey, true)

  data.isUserProtected = true
  if (onlyCheck) return data

  reducers.user.setAuthData({ name: 'btcMultisigUserData', data })
}

const login_ = (privateKey, otherOwnerPublicKey, sortKeys) => {
  let keyPair

  if (privateKey) {
    const hash  = bitcoin.crypto.sha256(privateKey)
    const d     = BigInteger.fromBuffer(hash)

    keyPair     = bitcoin.ECPair.fromWIF(privateKey, btc.network)
  }
  else {
    console.log('Requery privateKey')
    return false
  }

 
  const account       = bitcoin.ECPair.fromWIF(privateKey, btc.network) // eslint-disable-line
  const { publicKey } = account
  const publicKey_1 = account.publicKey.toString('hex')
  
  // TODO - simple sort public keys by ABC - no primary and secondary
  let _data
  if (otherOwnerPublicKey) {
    const publicKey_2 = otherOwnerPublicKey
    let publicKeysRaw = [ publicKey_2, publicKey_1 ]

    if (sortKeys) publicKeysRaw = publicKeysRaw.sort()

    const publicKeys = publicKeysRaw.map(hex => Buffer.from(hex, 'hex'))
    const p2ms = bitcoin.payments.p2ms({
      m: 2,
      n: 2,
      pubkeys: publicKeys,
      network: btc.network,
    })
    const p2sh = bitcoin.payments.p2sh({ redeem: p2ms, network: btc.network })
    
    const { address } = p2sh
    
    const { addressOfMyOwnWallet }   = bitcoin.payments.p2wpkh({ pubkey: account.publicKey, network: btc.network })

    _data = {
      account,
      keyPair,
      address,
      addressOfMyOwnWallet,
      currency: 'BTC (Multisig)',
      fullName: 'Bitcoin (Multisig)',
      privateKey,
      publicKeys,
      publicKey,
      active: true,
    }
  } else {
    _data = {
      account,
      keyPair,
      address: 'Not jointed',
      addressOfMyOwnWallet: 'Not jointed',
      currency: 'BTC (Multisig)',
      fullName: 'Bitcoin (Multisig)',
      privateKey,
      publicKeys: [],
      publicKey,
      active: false,
    }
  }
  
  return _data
}

const enableWalletSMS = () => {
  const { user: { btcMultisigSMSData } } = getState()
  btcMultisigSMSData.isRegistered = true
  reducers.user.setAuthData({ name: 'btcMultisigSMSData', btcMultisigSMSData })
}

const enableWalletG2FA = () => {
  const { user: { btcMultisigG2FAData } } = getState()
  btcMultisigG2FAData.isRegistered = true
  reducers.user.setAuthData({ name: 'btcMultisigG2FAData', btcMultisigG2FAData })
}

const enableWalletUSER = () => {
}

const _getSign = () => {
  const { user: { btcMultisigSMSData: { account, address, keyPair, publicKey } } } = getState()
  const message = `${address}:${publicKey.toString('hex')}`
  console.log(message)
  const sign = bitcoinMessage.sign(message, account.privateKey, keyPair.compressed)
  return sign.toString('base64')
}

const beginRegisterSMS = async (phone) => {
  const { user: { btcMultisigSMSData: { account, address, keyPair, publicKey } } } = getState()
  
  const sign = _getSign()
  const result = await request.post(`${protectSMSAPI}/register/begin/`, {
    body: {
      phone,
      address,
      publicKey: publicKey.toString('hex'),
      checkSign: sign,
      mainnet: process.env.MAINNET ? true : false,
    },
  })
  console.log(result)
  return result
}

const confirmRegisterSMS = async (phone, smsCode) => {
  const { user: { btcMultisigSMSData: { account, address, keyPair, publicKey } } } = getState()
  
  const sign = _getSign()
  const result = await request.post(`${protectSMSAPI}/register/confirm/`, {
    body: {
      phone,
      address,
      smsCode,
      publicKey: publicKey.toString('hex'),
      checkSign: sign,
      mainnet: process.env.MAINNET ? true : false,
    },
  })

  if ((result && result.answer && result.answer === 'ok') || (result.error === 'Already registered')) {
    localStorage.setItem(`${constants.localStorage.didProtectedBtcCreated}:${address}`, '1')
  }

  return result
}

const loginWithKeychain = async () => {
  console.warn('Not implements')
}

const getBalance = (ownAddress, ownDataKey) => {
  const { user: { btcMultisigSMSData: { address } } } = getState()
  const checkAddress = (ownAddress) ? ownAddress : address
  const dataKey = (ownDataKey) ? ownDataKey : 'btcMultisigSMSData'
  
  return request.get(`${api.getApiServer('bitpay')}/addr/${checkAddress}`)
    .then(({ balance, unconfirmedBalance }) => {
      reducers.user.setBalance({ name: dataKey, amount: balance, unconfirmedBalance })
      return balance
    })
    .catch((e) => {
      reducers.user.setBalanceError({ name: dataKey })
    })
}

const getBalanceUser = () => {
  const { user: { btcMultisigUserData: { address } } } = getState()
  return getBalance(address, 'btcMultisigUserData')
}

const fetchBalance = (address) =>
  request.get(`${api.getApiServer('bitpay')}/addr/${address}`)
    .then(({ balance }) => balance)

const fetchTx = (hash) =>
  request.get(`${api.getApiServer('bitpay')}/tx/${hash}`)
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
    const { user: { btcData: { address } } } = getState()

    const url = `${api.getApiServer('bitpay')}/txs/?address=${address}`

    return request.get(url)
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

const sendSMSProtected = async ({ from, to, amount, feeValue, speed } = {}) => {
  feeValue = feeValue || await btc.estimateFeeValue({ inSatoshis: true, speed })
  const { user: { btcMultisigSMSData: { address, privateKey, publicKeys, publicKey } } } = getState()

  const unspents      = await fetchUnspents(from)

  const fundValue     = new BigNumber(String(amount)).multipliedBy(1e8).integerValue().toNumber()
  const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
  const skipValue     = totalUnspent - fundValue - feeValue
  
  const p2ms = bitcoin.payments.p2ms({
    m: 2,
    n: 2,
    pubkeys: publicKeys,
    network: btc.network,
  })
  const p2sh = bitcoin.payments.p2sh({ redeem: p2ms, network: btc.network })
  
  console.log('P2SH Address:',p2sh.address)
  console.log('P2SH Script')
  console.log(bitcoin.script.toASM(p2sh.redeem.output))
  console.log(publicKey.toString('Hex'))
  console.log(bitcoin.ECPair.fromWIF(privateKey, btc.network).publicKey.toString('Hex'))


  let txb1 = new bitcoin.TransactionBuilder(btc.network)

  unspents.forEach(({ txid, vout }) => txb1.addInput(txid, vout, 0xfffffffe))
  txb1.addOutput(to, fundValue)

  if (skipValue > 546) {
    txb1.addOutput(from, skipValue)
  }
  
  txb1.__INPUTS.forEach((input, index) => {
    txb1.sign(index, bitcoin.ECPair.fromWIF(privateKey, btc.network), p2sh.redeem.output)
  })

  let txRaw = txb1.buildIncomplete()
  console.log('Multisig transaction ready')
  console.log('Your key:', publicKey.toString('Hex'))
  console.log('TX Hash:', txRaw.toHex())
  console.log('Send it to other owner for sign and broadcast')
  
  const result = await request.post(`${protectSMSAPI}/push/`, {
    body: {
      address,
      publicKey: publicKey.toString('hex'),
      checkSign: _getSign,
      rawTX: txRaw.toHex(),
      mainnet: process.env.MAINNET ? true : false,
    },
  })
  return result
}


const confirmSMSProtected = async ( smsCode ) => {
  const { user: { btcMultisigSMSData: { address, privateKey, publicKeys, publicKey } } } = getState()

  const result = await request.post(`${protectSMSAPI}/sign/`, {
    body: {
      address,
      publicKey: publicKey.toString('hex'),
      checkSign: _getSign,
      code: smsCode,
      mainnet: process.env.MAINNET ? true : false,
    },
  })
  return result
}

const send = async ({ from, to, amount, feeValue, speed } = {}) => {
  feeValue = feeValue || await btc.estimateFeeValue({ inSatoshis: true, speed })
  const { user: { btcMultisigSMSData: { address, privateKey, publicKeys, publicKey } } } = getState()

  const unspents      = await fetchUnspents(from)

  const fundValue     = new BigNumber(String(amount)).multipliedBy(1e8).integerValue().toNumber()
  const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
  const skipValue     = totalUnspent - fundValue - feeValue
  
  const p2ms = bitcoin.payments.p2ms({
    m: 2,
    n: 2,
    pubkeys: publicKeys,
    network: btc.network,
  })
  const p2sh = bitcoin.payments.p2sh({ redeem: p2ms, network: btc.network })
  
  console.log('P2SH Address:',p2sh.address)
  console.log('P2SH Script')
  console.log(bitcoin.script.toASM(p2sh.redeem.output))
  console.log(publicKey.toString('Hex'))
  console.log(bitcoin.ECPair.fromWIF(privateKey, btc.network).publicKey.toString('Hex'))


  let txb1 = new bitcoin.TransactionBuilder(btc.network)

  unspents.forEach(({ txid, vout }) => txb1.addInput(txid, vout, 0xfffffffe))
  txb1.addOutput(to, fundValue)

  if (skipValue > 546) {
    txb1.addOutput(from, skipValue)
  }
  
  txb1.__INPUTS.forEach((input, index) => {
    txb1.sign(index, bitcoin.ECPair.fromWIF(privateKey, btc.network), p2sh.redeem.output)
  })

  let txRaw = txb1.buildIncomplete()
  console.log('Multisig transaction ready')
  console.log('Your key:', publicKey.toString('Hex'))
  console.log('TX Hash:', txRaw.toHex())
  console.log('Send it to other owner for sign and broadcast')
  return txRaw.toHex()
  let tx1 = txb1.build()
  return tx1.toHex()
}

const signMultiSign = async ( txHash ) => {
  const { user: { btcMultisigSMSData: { privateKey, publicKey , publicKeys } } } = getState()
  
  // restore transaction from hex
  let txb = bitcoin.TransactionBuilder.fromTransaction(
    bitcoin.Transaction.fromHex(txHash),
    btc.network
  );

  const p2ms = bitcoin.payments.p2ms({
    m: 2,
    n: 2,
    pubkeys: publicKeys,
    network: btc.network,
  })

  const p2sh = bitcoin.payments.p2sh({ redeem: p2ms, network: btc.network })
  
  console.log('P2SH Address' ,p2sh.address)
  console.log('P2SH Script')
  console.log(bitcoin.script.toASM(p2sh.redeem.output))
  console.log(publicKey.toString('Hex'))
  console.log(bitcoin.ECPair.fromWIF(privateKey, btc.network).publicKey.toString('Hex'))
  // sign transaction with our key
  txb.__INPUTS.forEach((input, index) => {
    txb.sign(index, bitcoin.ECPair.fromWIF(privateKey, btc.network), p2sh.redeem.output)
  })

  let tx = await txb.build()
  
  window.multiSignTx = txb
  return tx.toHex()
}
window.MS_Sign = signMultiSign

const signAndBuild = (transactionBuilder, p2sh) => {
  const { user: { btcData: { privateKey } } } = getState()
  const keyPair = bitcoin.ECPair.fromWIF(privateKey, btc.network)

  transactionBuilder.__INPUTS.forEach((input, index) => {
    transactionBuilder.sign(index, keyPair, p2sh)
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
  request.get(`${api.getApiServer('bitpay')}/addr/${address}/utxo`, { cacheResponse: 5000 })

const broadcastTx = (txRaw) =>
  request.post(`${api.getApiServer('bitpay')}/tx/send`, {
    body: {
      rawtx: txRaw,
    },
  })
window.MS_broadcastTx = broadcastTx

const signMessage = (message, encodedPrivateKey) => {
  const keyPair = bitcoin.ECPair.fromWIF(encodedPrivateKey, [bitcoin.networks.bitcoin, bitcoin.networks.testnet])
  const privateKey = keyPair.d.toBuffer(32)

  const signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed)

  return signature.toString('base64')
}

const getReputation = () =>
  new Promise(async (resolve, reject) => {
    const { user: { btcMultisigSMSData: { address, privateKey } } } = getState()
    const addressOwnerSignature = signMessage(address, privateKey)

    request.post(`${api.getApiServer('swapsExplorer')}/reputation`, {
      json: true,
      body: {
        address,
        addressOwnerSignature,
      },
    }).then((response) => {
      const { reputation, reputationOracleSignature } = response

      //reducers.user.setReputation({ name: 'btcMultisigSMSData', reputation, reputationOracleSignature })
      resolve(reputation)
    }).catch((error) => {
      reject(error)
    })
  })

export default {
  beginRegisterSMS,
  confirmRegisterSMS,
  checkSMSActivated,
  checkG2FAActivated,
  checkUserActivated,
  login_SMS,
  login_G2FA,
  login_USER,
  loginWithKeychain,
  getBalance,
  getBalanceUser,
  getTransaction,
  send,
  sendSMSProtected,
  confirmSMSProtected,
  fetchUnspents,
  broadcastTx,
  fetchTx,
  fetchTxInfo,
  fetchBalance,
  signMessage,
  getReputation,
  enableWalletSMS,
  enableWalletG2FA,
  enableWalletUSER,
}
