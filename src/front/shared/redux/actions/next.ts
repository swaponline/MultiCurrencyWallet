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
import * as mnemonicUtils from '../../../../common/utils/mnemonic'
import { default as nextUtils } from '../../../../common/utils/coin/next'


const NETWORK = (process.env.MAINNET) ? `MAINNET` : `TESTNET`


const hasAdminFee = (config
  && config.opts
  && config.opts.fee
  && config.opts.fee.next
  && config.opts.fee.next.fee
  && config.opts.fee.next.address
  && config.opts.fee.next.min
) ? config.opts.fee.next : false

const getRandomMnemonicWords = () => bip39.generateMnemonic()
const validateMnemonicWords = (mnemonic) => bip39.validateMnemonic(mnemonicUtils.convertMnemonicToValid(mnemonic))


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

const getWalletByWords = (mnemonic: string, walletNumber: number = 0, path: string = '') => {
  return mnemonicUtils.getNextWallet(next.network, mnemonic, walletNumber, path)
}


const auth = (privateKey) => {
  if (!privateKey) {
    throw new Error('Missing privateKey')
  }
  //@ts-ignore
  const keyPair = bitcoin.ECPair.fromWIF(privateKey, next.network)
  //@ts-ignore
  const account = bitcoin.ECPair.fromWIF(privateKey, next.network)
  //@ts-ignore
  const { address } = bitcoin.payments.p2pkh({
    pubkey: account.publicKey,
    //@ts-ignore
    network: next.network,
  })

  const { publicKey } = account

  return {
    account,
    keyPair,
    address,
    privateKey,
    publicKey,
  }
}

const getPrivateKeyByAddress = (address) => {
  const {
    user: {
      nextData: {
        address: oldAddress,
        privateKey,
      },
    },
  } = getState()

  if (oldAddress === address) return privateKey
  //@ts-ignore
  if (mnemonicAddress === address) return mnemonicKey
}

const login = (privateKey, mnemonic = null, mnemonicKeys = null) => {
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
  } else {
    console.info('Created account Next ...')
    // keyPair     = bitcoin.ECPair.makeRandom({ network: next.network })
    // privateKey  = keyPair.toWIF()
    // use random 12 words
    if (!mnemonic) mnemonic = bip39.generateMnemonic()
    
    const accData = getWalletByWords(mnemonic)
    console.log('Next. Generated wallet from random 12 words')
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
  reducers.user.setAuthData({
    name: 'nextData',
    data,
  })
  if (!sweepToMnemonicReady) {
    // Auth with our mnemonic account
    if (mnemonic === `-`) {
      console.error('Sweep. Cant auth. Need new mnemonic or enter own for re-login')
      return
    }

    if (!mnemonicKeys || !mnemonicKeys.next) {
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
            //@ts-ignore
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
    //@ts-ignore
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
  return `${config.link.nextExplorer}/#/tx/${tx}`
}

const fetchBalanceStatus = (address) => {
  return apiLooper.get('nextExplorer', `/address/${address}`, {
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
  })).catch((e) => false)
}

const getBalance = () => {
  const { user: { nextData: { address } } } = getState()

  return apiLooper.get('nextExplorer', `/address/${address}`, {
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
    ignoreErrors: true,
  }).then((answer: any) => {
    const balance = (typeof answer.balance === 'undefined') ? 0 : answer.balance
    const unconfirmedBalance = (typeof answer.unconfirmedBalance === 'undefined') ? 0 : answer.unconfirmedBalance
    console.log('NEXT Balance: ', balance)
    console.log('NEXT unconfirmedBalance Balance: ', unconfirmedBalance)
    reducers.user.setBalance({
      name: 'nextData',
      amount: balance,
      unconfirmedBalance,
    })
    return balance
  }).catch((e) => {
    reducers.user.setBalanceError({ name: 'nextData' })
  })
}

const fetchBalance = (address) => nextUtils.fetchBalance({
  address,
  NETWORK,
})

const fetchTx = (hash, cacheResponse) => nextUtils.fetchTx({
  hash,
  cacheResponse,
  NETWORK,
})

const fetchTxRaw = (txId, cacheResponse) =>
  apiLooper.get('nextExplorer', `/rawtx/${txId}`, {
    cacheResponse,
    checkStatus: (answer) => {
      try {
        if (answer && answer.rawtx !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
  }).then(({ rawtx }) => rawtx)

const fetchTxInfo = (hash, cacheResponse) => nextUtils.fetchTxInfo({
  hash,
  cacheResponse,
  NETWORK,
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

const getTransaction = (address: string = ``, ownType: string = ``) =>
  new Promise((resolve) => {
    const myAllWallets = getAllMyAddresses()

    let { user: { nextData: { address: userAddress } } } = getState()
    address = address || userAddress

    const type = (ownType) || 'next'

    if (!typeforce.isCoinAddress.NEXT(address)) {
      resolve([])
    }

    return apiLooper.get('nextExplorer', `/txs/?address=${address}`, {
      checkStatus: (answer) => {
        try {
          if (answer && answer.txs !== undefined) return true
        } catch (e) { /* */ }
        return false
      },
      query: 'next_balance',
    }).then((res: any) => {
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

//@ts-ignore
const send = ({ from, to, amount, feeValue, speed } = {}) => {

  return new Promise(async (ready) => {
    bitcore.Networks.add({
      name: 'next-mainnet',
      pubkeyhash: next.network.pubKeyHash,
      privatekey: next.network.wif,
      scripthash: next.network.scriptHash,
      xpubkey: next.network.bip32.public,
      xprivkey: next.network.bip32.private,
      networkMagic: 0xcbe4d0a1,
      port: 7077,
    })
    const bitcoreNetwork = bitcore.Networks.get('next-mainnet')

    const privKeyWIF = getPrivateKeyByAddress(from)
    const privateKey = new bitcore.PrivateKey.fromWIF(privKeyWIF)
    const publicKey = bitcore.PublicKey(privateKey, bitcoreNetwork)
    const addressFrom = new bitcore.Address(publicKey, bitcoreNetwork)

    const unspents = await fetchUnspents(from)
    const amountSat = new BigNumber(String(amount)).multipliedBy(1e8).integerValue().toNumber()

    const transaction = new bitcore.Transaction()
      .from(unspents)
      .to(to, amountSat)
      .change(addressFrom)
      .sign(privateKey)

    const rawTx = String(transaction.serialize())
    const broadcastAnswer: any = await broadcastTx(rawTx)
    const txid = broadcastAnswer.raw
    ready(txid)
  })
}


const fetchUnspents = (address) => nextUtils.fetchUnspents({
  address,
  NETWORK,
})


const broadcastTx = (txRaw) => nextUtils.broadcastTx({
  txRaw,
  NETWORK,
})

const signMessage = (message, encodedPrivateKey) => {
  //@ts-ignore
  const keyPair = bitcoin.ECPair.fromWIF(encodedPrivateKey, [next.networks.mainnet])
  const privateKeyBuff = Buffer.from(keyPair.privateKey)

  const signature = bitcoinMessage.sign(message, privateKeyBuff, keyPair.compressed)

  return signature.toString('base64')
}

const getReputation = () => Promise.resolve(0)

const checkWithdraw = (scriptAddress) => nextUtils.checkWithdraw({
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
}
