import BigInteger from 'bigi'

import { BigNumber } from 'bignumber.js'
import * as bitcoin from 'bitcoinjs-lib'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'

import bitcoinMessage from 'bitcoinjs-message'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import { btc, apiLooper, constants, api } from 'helpers'
import actions from 'redux/actions'
import typeforce from 'swap.app/util/typeforce'
import config from 'app-config'

import { localisePrefix } from 'helpers/locale'

import * as mnemonicUtils from '../../../../common/utils/mnemonic'

import { default as bitcoinUtils } from '../../../../common/utils/coin/btc'


const NETWORK = (process.env.MAINNET) ? `MAINNET` : `TESTNET`


const hasAdminFee = (config
  && config.opts
  && config.opts.fee
  && config.opts.fee.btc
  && config.opts.fee.btc.fee
  && config.opts.fee.btc.address
  && config.opts.fee.btc.min
) ? config.opts.fee.btc : false

const getRandomMnemonicWords = () => bip39.generateMnemonic()
const validateMnemonicWords = (mnemonic) => bip39.validateMnemonic(convertMnemonicToValid(mnemonic))


const sweepToMnemonic = (mnemonic, path) => {
  const wallet = getWalletByWords(mnemonic, path)
  localStorage.setItem(constants.privateKeyNames.btcMnemonic, wallet.WIF)
  return wallet.WIF
}

const getMainPublicKey = () => {
  const {
    user: {
      btcData,
    },
  } = getState()

  return btcData.publicKey.toString('Hex')
}

const isSweeped = () => {
  const {
    user: {
      btcData,
      btcMnemonicData,
    },
  } = getState()

  if (btcMnemonicData
    && btcMnemonicData.address
    && btcData
    && btcData.address
    && btcData.address.toLowerCase() !== btcMnemonicData.address.toLowerCase()
  ) return false

  return true
}

const getSweepAddress = () => {
  const {
    user: {
      btcMnemonicData,
    },
  } = getState()

  if (btcMnemonicData && btcMnemonicData.address) return btcMnemonicData.address
  return false
}

const convertMnemonicToValid = (mnemonic) => mnemonicUtils.convertMnemonicToValid(mnemonic)

const getWalletByWords = (mnemonic: string, walletNumber: number = 0, path: string = '') => {
  return mnemonicUtils.getBtcWallet(btc.network, mnemonic, walletNumber, path)
}

const auth = (privateKey) => {
  if (privateKey) {
    const hash = bitcoin.crypto.sha256(privateKey)
    const d = BigInteger.fromBuffer(hash)

    const keyPair = bitcoin.ECPair.fromWIF(privateKey, btc.network)

    const account = bitcoin.ECPair.fromWIF(privateKey, btc.network) // eslint-disable-line
    const { address } = bitcoin.payments.p2pkh({ pubkey: account.publicKey, network: btc.network })
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
      btcData: {
        address: oldAddress,
        privateKey,
      },
      btcMnemonicData: {
        address: mnemonicAddress,
        privateKey: mnemonicKey,
      },
    },
  } = getState()

  if (oldAddress === address) return privateKey
  if (mnemonicAddress === address) return mnemonicKey
}

const login = (privateKey, mnemonic = null, mnemonicKeys = null) => {
  let sweepToMnemonicReady = false

  if (privateKey
    && mnemonic
    && mnemonicKeys
    && mnemonicKeys.btc === privateKey
  ) sweepToMnemonicReady = true

  if (!privateKey && mnemonic) sweepToMnemonicReady = true

  if (privateKey) {
    const hash = bitcoin.crypto.sha256(privateKey)
    const d = BigInteger.fromBuffer(hash)

    // keyPair     = bitcoin.ECPair.fromWIF(privateKey, btc.network)
  }
  else {
    console.info('Created account Bitcoin ...')
    // keyPair     = bitcoin.ECPair.makeRandom({ network: btc.network })
    // privateKey  = keyPair.toWIF()
    // use random 12 words
    if (!mnemonic) mnemonic = bip39.generateMnemonic()

    const accData = getWalletByWords(mnemonic)
    console.log('Btc. Generated wallet from random 12 words')
    console.log(accData)
    privateKey = accData.WIF
    localStorage.setItem(constants.privateKeyNames.btcMnemonic, privateKey)
  }

  localStorage.setItem(constants.privateKeyNames.btc, privateKey)

  const data = {
    ...auth(privateKey),
    isMnemonic: sweepToMnemonicReady,
    isBTC: true,
  }

  window.getBtcAddress = () => data.address
  window.getBtcData = () => data

  console.info('Logged in with Bitcoin', data)
  reducers.user.setAuthData({ name: 'btcData', data })
  if (!sweepToMnemonicReady) {
    // Auth with our mnemonic account
    if (mnemonic === `-`) {
      console.error('Sweep. Cant auth. Need new mnemonic or enter own for re-login')
      return
    }

    if (!mnemonicKeys
      || !mnemonicKeys.btc
    ) {
      console.error('Sweep. Cant auth. Login key undefined')
      return
    }

    const mnemonicData = {
      ...auth(mnemonicKeys.btc),
      isMnemonic: true,
    }
    console.info('Logged in with Bitcoin Mnemonic', mnemonicData)
    reducers.user.addWallet({
      name: 'btcMnemonicData',
      data: {
        currency: 'BTC',
        fullName: 'Bitcoin (New)',
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
          name: 'btcMnemonicData',
          data: {
            //@ts-ignore
            ...balanceData,
            isBalanceFetched: true,
          },
        })
      } else {
        reducers.user.setBalanceError({ name: 'btcMnemonicData' })
      }
      resolve(true)
    })
  }

  return privateKey
}


const getTxRouter = (txId) => `/btc/tx/${txId}`

const getTx = (txRaw) => {
  if (txRaw
    && txRaw.getId
    //@ts-ignore
    && txRaw.getId instanceof 'function'
  ) {
    return txRaw.getId()
  } else {
    return txRaw
  }
}


const getLinkToInfo = (tx) => {

  if (!tx) {
    return
  }

  return `${config.link.bitpay}/tx/${tx}`
}

const fetchBalanceStatus = (address) => {
  return new Promise((resolve) => {
    bitcoinUtils.fetchBalance({
      address,
      withUnconfirmed: true,
      NETWORK,
    }).then((answer) => {
      // @ts-ignore
      const { balance, unconfirmed } = answer
      resolve({
        address,
        balance: balance,
        unconfirmedBalance: unconfirmed,
      })
    }).catch((e) => {
      resolve(false)
    })
  })
}

const getBalance = () => {
  const {
    user: {
      btcData: {
        address,
      },
    },
  } = getState()

  return new Promise((resolve) => {
    bitcoinUtils.fetchBalance({
      address,
      withUnconfirmed: true,
      NETWORK,
    }).then((answer) => {
      // @ts-ignore
      const { balance, unconfirmed } = answer
      reducers.user.setBalance({
        name: 'btcData',
        amount: balance,
        unconfirmedBalance: unconfirmed,
      })
      resolve(balance)
    }).catch((e) => {
      reducers.user.setBalanceError({ name: 'btcData' })
      resolve(-1)
    })
  })
}


const fetchBalance = (address) => bitcoinUtils.fetchBalance({
  address,
  withUnconfirmed: false,
  NETWORK,
})


const fetchTxRaw = (txId, cacheResponse) => bitcoinUtils.fetchTxRaw({
  txId,
  cacheResponse,
  NETWORK,
})

const fetchTx = (hash, cacheResponse) => bitcoinUtils.fetchTx({
  hash,
  NETWORK,
  cacheResponse,
})

const fetchTxInfo = (hash, cacheResponse) => bitcoinUtils.fetchTxInfo({
  hash,
  NETWORK,
  cacheResponse,
  hasAdminFee,
})


const getInvoices = (address) => {
  const { user: { btcData: { userAddress } } } = getState()

  address = address || userAddress

  return actions.invoices.getInvoices({
    currency: 'BTC',
    address,
  })
}

const getAllMyAddresses = () => {
  const {
    user: {
      btcData,
      btcMnemonicData,
      btcMultisigSMSData,
      btcMultisigUserData,
      btcMultisigG2FAData,
      btcMultisigPinData,
    },
  } = getState()

  const retData = []
  // Проверяем, был ли sweep
  if (btcMnemonicData
    && btcMnemonicData.address
    && btcData
    && btcData.address
    && btcMnemonicData.address !== btcData.address
  ) {
    retData.push(btcMnemonicData.address.toLowerCase())
  }

  retData.push(btcData.address.toLowerCase())

  if (btcMultisigSMSData && btcMultisigSMSData.address) retData.push(btcMultisigSMSData.address.toLowerCase())
  // @ToDo - SMS MultiWallet

  if (btcMultisigUserData && btcMultisigUserData.address) retData.push(btcMultisigUserData.address.toLowerCase())
  if (btcMultisigUserData && btcMultisigUserData.wallets && btcMultisigUserData.wallets.length) {
    btcMultisigUserData.wallets.map((wallet) => {
      retData.push(wallet.address.toLowerCase())
    })
  }

  if (btcMultisigPinData && btcMultisigPinData.address) retData.push(btcMultisigPinData.address.toLowerCase())

  return retData
}

const getDataByAddress = (address) => {
  const {
    user: {
      btcData,
      btcMnemonicData,
      btcMultisigSMSData,
      btcMultisigUserData,
      btcMultisigG2FAData,
    },
  } = getState()

  const founded = [
    btcData,
    btcMnemonicData,
    btcMultisigSMSData,
    btcMultisigUserData,
    ...(
      btcMultisigUserData
      && btcMultisigUserData.wallets
      && btcMultisigUserData.wallets.length
    )
      ? btcMultisigUserData.wallets
      : [],
    btcMultisigG2FAData,
  ].filter(data => data && data.address && data.address.toLowerCase() === address.toLowerCase())

  return (founded.length) ? founded[0] : false
}

const getTransaction = (ownAddress: string = ``, ownType: string = ``) => {
  const myAllWallets = getAllMyAddresses()

  let { user: { btcData: { address: userAddress } } } = getState()
  const address = ownAddress || userAddress

  const type = (ownType) || 'btc'

  if (!typeforce.isCoinAddress.BTC(address)) {
    return new Promise((resolve) => { resolve([]) })
  }
  return bitcoinUtils.getTransactionBlocyper({
    address,
    ownType: type,
    myWallets: myAllWallets,
    network: btc.network,
    NETWORK,
  })
}

const send = (data) => {
  return sendV5(data)
}

const addressIsCorrect = (address) => {
  try {
    let outputScript = bitcoin.address.toOutputScript(address, btc.network)
    if (outputScript) return true
  } catch (e) {}
  return false
}

// Deprecated
//@ts-ignore
const sendWithAdminFee = async ({ from, to, amount, feeValue, speed } = {}) => {
  const {
    fee: adminFee,
    address: adminFeeAddress,
    min: adminFeeMinValue,
  } = config.opts.fee.btc

  const adminFeeMin = new BigNumber(adminFeeMinValue)

  // fee - from amount - percent
  let feeFromAmount: number | BigNumber = new BigNumber(adminFee).dividedBy(100).multipliedBy(amount)
  if (adminFeeMin.isGreaterThan(feeFromAmount)) feeFromAmount = adminFeeMin

  feeFromAmount = feeFromAmount.multipliedBy(1e8).integerValue() // Admin fee in satoshi
  feeFromAmount = feeFromAmount.toNumber()
  feeValue = feeValue || await btc.estimateFeeValue({ inSatoshis: true, speed })

  const tx = new bitcoin.TransactionBuilder(btc.network)
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
  tx.addOutput(adminFeeAddress, feeFromAmount)

  const txRaw = signAndBuild(tx, from)

  await broadcastTx(txRaw.toHex())

  return txRaw
}

//@ts-ignore
const sendV5 = ({ from, to, amount, feeValue, speed, stateCallback } = {}) => {
  return new Promise(async (ready) => {
    const privateKey = getPrivateKeyByAddress(from)

    const keyPair = bitcoin.ECPair.fromWIF(privateKey, btc.network)

    // fee - from amount - percent
    let feeFromAmount: number | BigNumber = new BigNumber(0)

    if (hasAdminFee) {
      const {
        fee: adminFee,
        min: adminFeeMinValue,
      } = config.opts.fee.btc

      const adminFeeMin = new BigNumber(adminFeeMinValue)

      feeFromAmount = new BigNumber(adminFee).dividedBy(100).multipliedBy(amount)
      if (adminFeeMin.isGreaterThan(feeFromAmount)) feeFromAmount = adminFeeMin

      feeFromAmount = feeFromAmount.multipliedBy(1e8).integerValue() // Admin fee in satoshi
    }
    feeFromAmount = feeFromAmount.toNumber()
    feeValue = feeValue || await btc.estimateFeeValue({ inSatoshis: true, speed, amount})

    let unspents = await fetchUnspents(from)
    unspents = await prepareUnspents({ unspents, amount })
    const fundValue = new BigNumber(String(amount)).multipliedBy(1e8).integerValue().toNumber()
    const totalUnspent = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)

    const skipValue = totalUnspent - fundValue - feeValue - feeFromAmount

    const psbt = new bitcoin.Psbt({network: btc.network})

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

    if (hasAdminFee) {
      psbt.addOutput({
        address: hasAdminFee.address,
        value: feeFromAmount,
      })
    }

    for (let i = 0; i < unspents.length; i++) {
      const { txid, vout } = unspents[i]
      let rawTx = false
      //@ts-ignore
      rawTx = await fetchTxRaw(txid)

      psbt.addInput({
        hash: txid,
        index: vout,
        //@ts-ignore
        nonWitnessUtxo: Buffer.from(rawTx, 'hex'),
      })
    }

    psbt.signAllInputs(keyPair)
    psbt.finalizeAllInputs()

    const rawTx = psbt.extractTransaction().toHex();

    const broadcastAnswer = await broadcastTx(rawTx)

    const { txid } = broadcastAnswer
    ready(txid)
  })
}

// Deprecated
//@ts-ignore
const sendDefault = async ({ from, to, amount, feeValue, speed } = {}) => {
  feeValue = feeValue || await btc.estimateFeeValue({ inSatoshis: true, speed })

  const tx = new bitcoin.TransactionBuilder(btc.network)
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

const signAndBuild = (transactionBuilder, address) => {
  let { user: { btcData: { privateKey } } } = getState()

  if (address) {
    // multi wallet - sweep upgrade
    privateKey = getPrivateKeyByAddress(address)
  } else {
    // single wallet - use btcData
  }

  const keyPair = bitcoin.ECPair.fromWIF(privateKey, btc.network)

  transactionBuilder.__INPUTS.forEach((input, index) => {
    transactionBuilder.sign(index, keyPair)
  })
  return transactionBuilder.buildIncomplete()
}

const prepareUnspents = ({ amount, unspents }) => bitcoinUtils.prepareUnspents({
  amount,
  unspents,
  NETWORK,
})

window.prepareUnspents = prepareUnspents
const fetchUnspents = (address) => bitcoinUtils.fetchUnspents({
  address,
  NETWORK,
})

const broadcastTx = (txRaw) => bitcoinUtils.broadcastTx({
  txRaw,
  NETWORK,
})

const signMessage = (message, encodedPrivateKey) => {
  const keyPair = bitcoin.ECPair.fromWIF(encodedPrivateKey, [bitcoin.networks.bitcoin, bitcoin.networks.testnet])
  const privateKeyBuff = Buffer.from(keyPair.privateKey)

  const signature = bitcoinMessage.sign(message, privateKeyBuff, keyPair.compressed)

  return signature.toString('base64')
}

const getReputation = () => Promise.resolve(0)

const checkWithdraw = (scriptAddress) => bitcoinUtils.checkWithdraw({
  scriptAddress,
  NETWORK,
})


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
  addressIsCorrect,
  convertMnemonicToValid,
  prepareUnspents,
}
