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
import { default as mnemonicUtils } from '../../../../common/utils/mnemonic'


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

const getWalletByWords = (mnemonic, walletNumber = 0, path) => {
  return mnemonicUtils.getNextWallet(next.network, mnemonic, walletNumber, path)
}


const auth = (privateKey) => {
  if (!privateKey) {
    throw new Error('Missing privateKey')
  }

  const keyPair = bitcoin.ECPair.fromWIF(privateKey, next.network)
  const account = bitcoin.ECPair.fromWIF(privateKey, next.network)

  const { address } = bitcoin.payments.p2pkh({
    pubkey: account.publicKey,
    network: next.network,
  })
  console.log('front next auth', address)
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
  } else {
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
  }).then((answer) => {
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

const fetchBalance = (address) => {
  console.log('>>>fetchBalance')
  return apiLooper.get('nextExplorer', `/address/${address}`, {
    checkStatus: (answer) => {
      console.log('>>>fetchBalance - status', answer)
      try {
        if (answer && answer.balance !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
    ignoreErrors: true,
    reportErrors: (answer, onSuccess, onFail) => {
      onSuccess({ balance: 0 })
      return true
    },
  }).then(({ balance }) => balance)
}

const fetchTx = (hash, cacheResponse) =>
  apiLooper.get('nextExplorer', `/tx/${hash}`, {
    cacheResponse,
    checkStatus: (answer) => {
      try {
        if (answer && answer.txId !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
  }).then(({ amountIn, amountOut, ...rest }) => ({
    fees: BigNumber(amountIn).minus(amountOut).multipliedBy(1e8),
    ...rest,
  }))

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

/** to-do  not working **/
const fetchTxInfo = (hash, cacheResponse) =>
  fetchTx(hash, cacheResponse)
    .then((txInfo_) => {
      
      console.log('txInfo', txInfo_)
      return { ...txInfo_ }
      const { vin, vout, ...rest } = txInfo_
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

    return apiLooper.get('nextExplorer', `/txs/?address=${address}`, {
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
    const broadcastAnswer = await broadcastTx(rawTx)
    const txid = broadcastAnswer.raw
    ready(txid)
  })
}


const fetchUnspents = (address) =>
  apiLooper.get('nextExplorerCustom', `/addr/${address}/utxo`, { cacheResponse: 5000 })


const broadcastTx = (rawTx) => {
  return apiLooper.post('nextExplorer', `/sendrawtransaction`, {
    body: {
      rawtx: rawTx,
    },
  })
}

const signMessage = (message, encodedPrivateKey) => {
  const keyPair = bitcoin.ECPair.fromWIF(encodedPrivateKey, [next.networks.mainnet])
  const privateKeyBuff = Buffer.from(keyPair.privateKey)

  const signature = bitcoinMessage.sign(message, privateKeyBuff, keyPair.compressed)

  return signature.toString('base64')
}

const getReputation = () => Promise.resolve(0)

window.getMainPublicKey = getMainPublicKey


const checkWithdraw = (scriptAddress) => {
  return apiLooper.get('nextExplorerCustom', `/txs/${scriptAddress}`, {
    checkStatus: (answer) => {
      try {
        if (answer && answer.txs !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
    query: 'next_balance',
  }).then((res) => {
    console.log('res', res)
    if (res.txs.length > 1
      && res.txs[0].vout.length
    ) {
      const address = res.txs[0].vout[0].scriptPubKey.addresses[0]
      const amount = res.txs[0].vout[0].valueSat

      const {
        txid,
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
