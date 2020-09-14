import BigInteger from 'bigi'

import { BigNumber } from 'bignumber.js'
import * as bitcoin from 'bitcoinjs-lib'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'

import bitcoinMessage from 'bitcoinjs-message'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import { next, apiLooper, constants, api } from 'helpers'
import actions from 'redux/actions'
import typeforce from 'swap.app/util/typeforce'
import config from 'app-config'
const bitcore = require('bitcore-lib')
import { localisePrefix } from 'helpers/locale'


const hasAdminFee = (config
  && config.opts
  && config.opts.fee
  && config.opts.fee.next
  && config.opts.fee.next.fee
  && config.opts.fee.next.address
  && config.opts.fee.next.min
) ? config.opts.fee.next : false

const getRandomMnemonicWords = () => bip39.generateMnemonic()
const validateMnemonicWords = (mnemonic) => bip39.validateMnemonic(mnemonic)


const sweepToMnemonic = (mnemonic, path) => {
  const wallet = getWalletByWords(mnemonic, path)
  localStorage.setItem(constants.privateKeyNames.nextMnemonic, wallet.WIF)
  return wallet.WIF
}

const getMainPublicKey = () => {
  const {
    user: {
      nextData,
    },
  } = getState()

  return nextData.publicKey.toString('Hex')
}

const isSweeped = () => {
  const {
    user: {
      nextData,
      nextMnemonicData,
    },
  } = getState()

  if (nextMnemonicData
    && nextMnemonicData.address
    && nextData
    && nextData.address
    && nextData.address.toLowerCase() !== nextMnemonicData.address.toLowerCase()
  ) return false

  return true
}

const getSweepAddress = () => {
  const {
    user: {
      nextMnemonicData,
    },
  } = getState()

  if (nextMnemonicData && nextMnemonicData.address) return nextMnemonicData.address
  return false
}

const getWalletByWords = (mnemonic, walletNumber = 0, path) => {
  const seed = bip39.mnemonicToSeedSync(mnemonic)
  const root = bip32.fromSeed(seed, next.network)
  const node = root.derivePath((path) || `m/44'/707'/0'/0/${walletNumber}`)
console.log('>>>getWalletByWords')
  const account = bitcoin.payments.p2pkh({
    pubkey: node.publicKey,
    network: next.network,
  })
console.log('account =', account)

  return {
    mnemonic,
    address: account.address,
    publicKey: node.publicKey.toString('Hex'),
    WIF: node.toWIF(),
    node,
    account,
  }
}

window.getWalletByWords = getWalletByWords

const auth = (privateKey) => {
  if (privateKey) {
    const hash = bitcoin.crypto.sha256(privateKey)
    const d = BigInteger.fromBuffer(hash)

    const keyPair = bitcoin.ECPair.fromWIF(privateKey, next.network)
console.log('>>>auth')
    const account = bitcoin.ECPair.fromWIF(privateKey, next.network) // eslint-disable-line
console.log('account =', account)
    const { address } = bitcoin.payments.p2pkh({ pubkey: account.publicKey, network: next.network })
    const { publicKey } = account

    return {
      account,
      keyPair,
      address,
      privateKey,
      publicKey,
    }
  }
}

const getPrivateKeyByAddress = (address) => {
  const {
    user: {
      nextData: {
        address: oldAddress,
        privateKey,
      }
    },
  } = getState()
  /*
  const nextMnemonicData
      nextMnemonicData: {
        address: mnemonicAddress,
        privateKey: mnemonicKey,
      },
    },
  } = getState()
  */
  if (oldAddress === address) return privateKey
  if (mnemonicAddress === address) return mnemonicKey
}

const login = (privateKey, mnemonic, mnemonicKeys) => {
  let sweepToMnemonicReady = false

  if (privateKey
    && mnemonic
    && mnemonicKeys
    && mnemonicKeys.next === privateKey
  ) sweepToMnemonicReady = true

  if (!privateKey && mnemonic) sweepToMnemonicReady = true

  if (privateKey) {
    const hash = bitcoin.crypto.sha256(privateKey)
    const d = BigInteger.fromBuffer(hash)

    // keyPair     = bitcoin.ECPair.fromWIF(privateKey, next.network)
  }
  else {
    console.info('Created account Next ...')
    // keyPair     = bitcoin.ECPair.makeRandom({ network: next.network })
    // privateKey  = keyPair.toWIF()
    // use random 12 words
    if (!mnemonic) mnemonic = bip39.generateMnemonic()
    const accData = getWalletByWords(mnemonic)
    console.log('Next. Generated walled from random 12 words')
    console.log(accData)
    privateKey = accData.WIF
    localStorage.setItem(constants.privateKeyNames.nextMnemonic, privateKey)
  }

  localStorage.setItem(constants.privateKeyNames.next, privateKey)

  const data = {
    ...auth(privateKey),
    isMnemonic: sweepToMnemonicReady,
    currency: 'NEXT',
    fullName: 'NEXT.coin',
  }

  window.getNextAddress = () => data.address
  window.getNextData = () => data

  console.info('Logged in with Next', data)
  reducers.user.setAuthData({ name: 'nextData', data })
  if (!sweepToMnemonicReady) {
    // Auth with our mnemonic account
    if (mnemonic === `-`) {
      console.error('Sweep. Cant auth. Need new mnemonic or enter own for re-login')
      return
    }

    if (!mnemonicKeys
      || !mnemonicKeys.next
    ) {
      console.error('Sweep. Cant auth. Login key undefined')
      return
    }

    const mnemonicData = {
      ...auth(mnemonicKeys.next),
      isMnemonic: true,
    }
    console.info('Logged in with Next Mnemonic', mnemonicData)
    reducers.user.addWallet({
      name: 'nextMnemonicData',
      data: {
        currency: 'NEXT',
        fullName: 'Next (New)',
        balance: 0,
        isBalanceFetched: false,
        balanceError: null,
        infoAboutCurrency: null,
        ...mnemonicData,
      },
    })
    new Promise(async (resolve) => {
      const balanceData = await fetchBalanceStatus(mnemonicData.address)
      if (balanceData) {
        reducers.user.setAuthData({
          name: 'nextMnemonicData',
          data: {
            ...balanceData,
            isBalanceFetched: true,
          },
        })
      } else {
        reducers.user.setBalanceError({ name: 'nextMnemonicData' })
      }
      resolve(true)
    })
  }

  return privateKey
}


const getTx = (txRaw) => {
  if (txRaw
    && txRaw.getId
    && txRaw.getId instanceof 'function'
  ) {
    return txRaw.getId()
  } else {
    return txRaw
  }
}

const getTxRouter = (txId) => `/next/tx/${txId}`

const getLinkToInfo = (tx) => {
  if (!tx) {
    return
  }
  return `${config.link.ghostscan}/tx/${tx}`
}

const fetchBalanceStatus = (address) => apiLooper.get('ghostscan', `/addr/${address}`, {
  checkStatus: (answer) => {
    try {
      if (answer && answer.balance !== undefined) return true
    } catch (e) { /* */console.log(e) }
    return false
  },
}).then(({ balance, unconfirmedBalance }) => ({
  address,
  balance,
  unconfirmedBalance,
}))
  .catch((e) => false)

const getBalance = () => {
  const { user: { nextData: { address } } } = getState()

  return apiLooper.get('ghostscan', `/addr/${address}`, {
    inQuery: {
      delay: 500,
      name: `balance`,
    },
    checkStatus: (answer) => {
      try {
        if (answer && answer.balance !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
  }).then(({ balance, unconfirmedBalance }) => {
    console.log('NEXT Balance: ', balance)
    console.log('NEXT unconfirmedBalance Balance: ', unconfirmedBalance)
    reducers.user.setBalance({ name: 'nextData', amount: balance, unconfirmedBalance })
    return balance
  })
    .catch((e) => {
      reducers.user.setBalanceError({ name: 'nextData' })
    })
}

const fetchBalance = (address) =>
  apiLooper.get('ghostscan', `/addr/${address}`, {
    checkStatus: (answer) => {
      try {
        if (answer && answer.balance !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
  }).then(({ balance }) => balance)

const fetchTx = (hash, cacheResponse) =>
  apiLooper.get('ghostscan', `/tx/${hash}`, {
    cacheResponse,
    checkStatus: (answer) => {
      try {
        if (answer && answer.fees !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
  }).then(({ fees, ...rest }) => ({
    fees: BigNumber(fees).multipliedBy(1e8),
    ...rest,
  }))

const fetchTxRaw = (txId, cacheResponse) =>
  apiLooper.get('ghostscan', `/rawtx/${txId}`, {
    cacheResponse,
    checkStatus: (answer) => {
      try {
        if (answer && answer.rawtx !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
  }).then(({ rawtx }) => rawtx)

const fetchTxInfo = (hash, cacheResponse) =>
  fetchTx(hash, cacheResponse)
    .then(({ vin, vout, ...rest }) => {
      const senderAddress = vin ? vin[0].addr : null
      const amount = vout ? new BigNumber(vout[0].value).toNumber() : null

      let afterBalance = vout && vout[1] ? new BigNumber(vout[1].value).toNumber() : null
      let adminFee = false

      if (hasAdminFee) {
        const adminOutput = vout.filter((out) => (
          out.scriptPubKey.addresses
          && out.scriptPubKey.addresses[0] === hasAdminFee.address
          && !(new BigNumber(out.value).eq(amount))
        ))

        const afterOutput = vout.filter((out) => (
          out.addresses
          && out.addresses[0] !== hasAdminFee.address
          && out.addresses[0] !== senderAddress
        ))

        if (afterOutput.length) {
          afterBalance = new BigNumber(afterOutput[0].value).toNumber()
        }

        if (adminOutput.length) {
          adminFee = new BigNumber(adminOutput[0].value).toNumber()
        }
      }

      const txInfo = {
        amount,
        afterBalance,
        senderAddress,
        receiverAddress: vout ? vout[0].scriptPubKey.addresses : null,
        confirmed: !!(rest.confirmations),
        minerFee: rest.fees.dividedBy(1e8).toNumber(),
        adminFee,
        minerFeeCurrency: 'NEXT',
        outputs: vout.map((out) => ({
          amount: new BigNumber(out.value).toNumber(),
          address: out.scriptPubKey.addresses || null,
        })),
        ...rest,
      }

      return txInfo
    })

const getInvoices = (address) => {
  const { user: { nextData: { userAddress } } } = getState()

  address = address || userAddress

  return actions.invoices.getInvoices({
    currency: 'NEXT',
    address,
  })
}

const getAllMyAddresses = () => {
  const {
    user: {
      nextData,
      nextMnemonicData,
      nextMultisigSMSData,
      nextMultisigUserData,
      nextMultisigG2FAData,
      nextMultisigPinData,
    },
  } = getState()

  const retData = []
  // Проверяем, был ли sweep
  if (nextMnemonicData
    && nextMnemonicData.address
    && nextData
    && nextData.address
    && nextMnemonicData.address !== nextData.address
  ) {
    retData.push(nextMnemonicData.address.toLowerCase())
  }

  retData.push(nextData.address.toLowerCase())

  if (nextMultisigSMSData && nextMultisigSMSData.address) retData.push(nextMultisigSMSData.address.toLowerCase())
  // @ToDo - SMS MultiWallet

  if (nextMultisigUserData && nextMultisigUserData.address) retData.push(nextMultisigUserData.address.toLowerCase())
  if (nextMultisigUserData && nextMultisigUserData.wallets && nextMultisigUserData.wallets.length) {
    nextMultisigUserData.wallets.map((wallet) => {
      retData.push(wallet.address.toLowerCase())
    })
  }

  if (nextMultisigPinData && nextMultisigPinData.address) retData.push(nextMultisigPinData.address.toLowerCase())

  return retData
}

const getDataByAddress = (address) => {
  const {
    user: {
      nextData,
      nextMnemonicData,
      nextMultisigSMSData,
      nextMultisigUserData,
      nextMultisigG2FAData,
    },
  } = getState()

  const founded = [
    nextData,
    nextMnemonicData,
    nextMultisigSMSData,
    nextMultisigUserData,
    ...(
      nextMultisigUserData
      && nextMultisigUserData.wallets
      && nextMultisigUserData.wallets.length
    )
      ? nextMultisigUserData.wallets
      : [],
    nextMultisigG2FAData,
  ].filter(data => data && data.address && data.address.toLowerCase() === address.toLowerCase())

  return (founded.length) ? founded[0] : false
}

const getTransaction = (address, ownType) =>
  new Promise((resolve) => {
    const myAllWallets = getAllMyAddresses()

    let { user: { nextData: { address: userAddress } } } = getState()
    address = address || userAddress

    const type = (ownType) || 'next'

    if (!typeforce.isCoinAddress.NEXT(address)) {
      resolve([])
    }

    const url = `/txs/?address=${address}`

    return apiLooper.get('ghostscan', url, {
      checkStatus: (answer) => {
        try {
          if (answer && answer.txs !== undefined) return true
        } catch (e) { /* */ }
        return false
      },
      query: 'next_balance',
    }).then((res) => {
      const transactions = res.txs.map((item) => {
        const direction = item.vin[0].addr !== address ? 'in' : 'out'

        const isSelf = direction === 'out'
          && item.vout.filter((item) =>
            item.scriptPubKey.addresses[0] === address
          ).length === item.vout.length

        return ({
          type,
          hash: item.txid,
          canEdit: (myAllWallets.indexOf(address) !== -1),
          confirmations: item.confirmations,
          value: isSelf
            ? item.fees
            : item.vout.filter((item) => {
              if (!item.scriptPubKey.addresses) return false
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

const send = (data) => {
  return sendBitcore(data)
}

const sendV5WithAdminFee = async ({ from, to, amount, feeValue, speed } = {}) => {
  const privateKey = getPrivateKeyByAddress(from)
  const keyPair = bitcoin.ECPair.fromWIF(privateKey, next.network)
  const {
    fee: adminFee,
    address: adminFeeAddress,
    min: adminFeeMinValue,
  } = config.opts.fee.next
  const adminFeeMin = BigNumber(adminFeeMinValue)

  feeValue = feeValue || await next.estimateFeeValue({ inSatoshis: true, speed })


  // fee - from amount - percent
  let feeFromAmount = BigNumber(adminFee).dividedBy(100).multipliedBy(amount)
  if (adminFeeMin.isGreaterThan(feeFromAmount)) feeFromAmount = adminFeeMin

  feeFromAmount = feeFromAmount.multipliedBy(1e8).integerValue().toNumber()

  const unspents = await fetchUnspents(from)
  const fundValue = new BigNumber(String(amount)).multipliedBy(1e8).integerValue().toNumber()
  const totalUnspent = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
  const skipValue = totalUnspent - fundValue - feeValue - feeFromAmount


  const psbt = new bitcoin.Psbt({ network: next.network })

  psbt.setVersion(160);

  psbt.addOutput({
    address: to,
    value: fundValue,
  })

  if (skipValue > 546) {
    psbt.addOutput({
      address: from,
      value: skipValue,
    })
  }

  // admin fee output
  psbt.addOutput({
    address: adminFeeAddress,
    value: feeFromAmount,
  })

  for (let i = 0; i < unspents.length; i++) {
    const { txid, vout } = unspents[i]
    const rawTx = await fetchTxRaw(txid)
    psbt.addInput({
      hash: txid,
      index: vout,
      nonWitnessUtxo: Buffer.from(rawTx, 'hex'),
    })
  }

  psbt.signAllInputs(keyPair)

  psbt.finalizeAllInputs()

  const rawTx = psbt.extractTransaction().toHex();

  const broadcastAnswer = await broadcastTx(rawTx)

  const { txid } = broadcastAnswer
  return txid
}

const sendWithAdminFee = async ({ from, to, amount, feeValue, speed } = {}) => {

  const {
    fee: adminFee,
    address: adminFeeAddress,
    min: adminFeeMinValue,
  } = config.opts.fee.next
  const adminFeeMin = BigNumber(adminFeeMinValue)

  // fee - from amount - percent
  let feeFromAmount = BigNumber(adminFee).dividedBy(100).multipliedBy(amount)
  if (adminFeeMin.isGreaterThan(feeFromAmount)) feeFromAmount = adminFeeMin

  feeFromAmount = feeFromAmount.multipliedBy(1e8).integerValue() // Admin fee in satoshi


  feeValue = feeValue || await next.estimateFeeValue({ inSatoshis: true, speed })

  const tx = new bitcoin.TransactionBuilder(next.network)
  const unspents = await fetchUnspents(from)

  let fundValue = new BigNumber(String(amount)).multipliedBy(1e8).integerValue().toNumber()

  const totalUnspent = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
  const skipValue = totalUnspent - fundValue - feeValue - feeFromAmount

  unspents.forEach(({ txid, vout }) => tx.addInput(txid, vout, 0xfffffffe))
  tx.addOutput(to, fundValue)

  if (skipValue > 546) {
    tx.addOutput(from, skipValue)
  }

  // admin fee output
  tx.addOutput(adminFeeAddress, feeFromAmount.toNumber())

  const txRaw = signAndBuild(tx, from)

  await broadcastTx(txRaw.toHex())

  return txRaw
}


const sendV5Default = async ({ from, to, amount, feeValue, speed } = {}) => {
  const privateKey = getPrivateKeyByAddress(from)
  const keyPair = bitcoin.ECPair.fromWIF(privateKey, next.network)

  let feeFromAmount = BigNumber(0)
  if (hasAdminFee) {
    const {
      fee: adminFee,
      min: adminFeeMinValue,
    } = config.opts.fee.btc
    const adminFeeMin = BigNumber(adminFeeMinValue)

    feeFromAmount = BigNumber(adminFee).dividedBy(100).multipliedBy(amount)
    if (adminFeeMin.isGreaterThan(feeFromAmount)) feeFromAmount = adminFeeMin

    feeFromAmount = feeFromAmount.multipliedBy(1e8).integerValue().toNumber() // Admin fee in satoshi
  }
  feeValue = feeValue || await next.estimateFeeValue({ inSatoshis: true, speed })

  const unspents = await fetchUnspents(from)
  const fundValue = new BigNumber(String(amount)).multipliedBy(1e8).integerValue().toNumber()
  const totalUnspent = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
  const skipValue = totalUnspent - fundValue - feeValue - feeFromAmount

  const psbt = new bitcoin.Psbt({ network: next.network })
  
  psbt.setVersion(160);

  psbt.addOutput({
    address: to,
    value: fundValue,
  })

  if (skipValue > 546) {
    psbt.addOutput({
      address: from,
      value: skipValue
    })
  }

  for (let i = 0; i < unspents.length; i++) {
    const { txid, vout } = unspents[i]
    let rawTx = false
    rawTx = await fetchTxRaw(txid)

    psbt.addInput({
      hash: txid,
      index: vout,
      nonWitnessUtxo: Buffer.from(rawTx, 'hex'),
    })
  }

  psbt.signAllInputs(keyPair)
  psbt.finalizeAllInputs()

  const rawTx = psbt.extractTransaction().toHex();


  const broadcastAnswer = await broadcastTx(rawTx)

  const { txid } = broadcastAnswer
  return txid
}

const sendDefault = async ({ from, to, amount, feeValue, speed } = {}) => {
  feeValue = feeValue || await next.estimateFeeValue({ inSatoshis: true, speed })
  const tx = new bitcoin.TransactionBuilder(next.network)
  tx.setVersion(160);
  const unspents = await fetchUnspents(from)

  const fundValue = new BigNumber(String(amount)).multipliedBy(1e8).integerValue().toNumber()
  const totalUnspent = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
  const skipValue = totalUnspent - fundValue - feeValue
  unspents.forEach(({ txid, vout }) => tx.addInput(txid, vout, 0xfffffffe))
  tx.addOutput(to, fundValue)

  if (skipValue > 546) {
    tx.addOutput(from, skipValue)
  }

  const txRaw = signAndBuild(tx, from)

  await broadcastTx(txRaw.toHex())

  return txRaw
}

const sendBitcore = ({ from, to, amount, feeValue, speed } = {}) => {
  return new Promise(async (ready) => {
    const privKey = getPrivateKeyByAddress(from)
    const unspents = await fetchUnspents(from)
    const fundValue = new BigNumber(String(amount)).multipliedBy(1e8).integerValue().toNumber()

    const transaction = new bitcore.Transaction()
      .from(unspents) // Feed information about what unspent outputs one can use
      .to(to, fundValue) // Add an output with the given amount of satoshis
      .change(from) // Sets up a change address where the rest of the funds will go
      .sign(privKey) // Signs all the inputs it can*/


    const broadcastAnswer = await broadcastTx(String(transaction.serialize()))

    const { txid } = broadcastAnswer
    ready(txid)
  })
}

const signAndBuild = (transactionBuilder, address) => {
  let { user: { nextData: { privateKey } } } = getState()

  if (address) {
    // multi wallet - sweep upgrade
    privateKey = getPrivateKeyByAddress(address)
  } else {
    // single wallet - use nextData
  }

  const keyPair = bitcoin.ECPair.fromWIF(privateKey, next.network)

  transactionBuilder.__INPUTS.forEach((input, index) => {
    transactionBuilder.sign(index, keyPair)
  })
  return transactionBuilder.buildIncomplete()
}

const fetchUnspents = (address) =>
  apiLooper.get('ghostscan', `/addr/${address}/utxo`, { cacheResponse: 5000 })

const broadcastTx = (txRaw) =>
  apiLooper.post('ghostscan', `/tx/send`, {
    body: {
      rawtx: txRaw,
    },
  })

const signMessage = (message, encodedPrivateKey) => {
  const keyPair = bitcoin.ECPair.fromWIF(encodedPrivateKey, [next.networks.mainnet])
  const privateKeyBuff = Buffer.from(keyPair.privateKey)

  const signature = bitcoinMessage.sign(message, privateKeyBuff, keyPair.compressed)

  return signature.toString('base64')
}

const getReputation = () => Promise.resolve(0)

window.getMainPublicKey = getMainPublicKey

/*
  Проверяет списание со скрипта - последняя транзакция выхода
  Возвращает txId, адресс и сумму
*/
const checkWithdraw = (scriptAddress) => {
  const url = `/txs/?address=${scriptAddress}`

  return apiLooper.get('ghostscan', url, {
    checkStatus: (answer) => {
      try {
        if (answer && answer.txs !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
    query: 'next_balance',
  }).then((res) => {
    if (res.txs.length > 1
      && res.txs[0].vout.length
    ) {
      const address = res.txs[0].vout[0].scriptPubKey.addresses[0]
      const {
        txid,
        valueOut: amount,
      } = res.txs[0]
      return {
        address,
        txid,
        amount,
      }
    }
    return false
  })
}

window.nextCheckWithdraw = checkWithdraw

export default {
  login,
  checkWithdraw,
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
  getTx,
  getLinkToInfo,
  getInvoices,
  getWalletByWords,
  getRandomMnemonicWords,
  validateMnemonicWords,
  sweepToMnemonic,
  isSweeped,
  getSweepAddress,
  getAllMyAddresses,
  getDataByAddress,
  getMainPublicKey,
  getTxRouter,
  fetchTxRaw,
}
