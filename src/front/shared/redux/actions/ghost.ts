import BigInteger from 'bigi'

import { BigNumber } from 'bignumber.js'
import * as bitcoin from 'bitcoinjs-lib'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'

import bitcoinMessage from 'bitcoinjs-message'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import { ghost, apiLooper, constants, api } from 'helpers'
import actions from 'redux/actions'
import typeforce from 'swap.app/util/typeforce'
import config from 'app-config'
const bitcore = require('ghost-bitcore-lib');
import { localisePrefix } from 'helpers/locale'

import * as mnemonicUtils from '../../../../common/utils/mnemonic'



const hasAdminFee = (config
  && config.opts
  && config.opts.fee
  && config.opts.fee.ghost
  && config.opts.fee.ghost.fee
  && config.opts.fee.ghost.address
  && config.opts.fee.ghost.min
) ? config.opts.fee.ghost : false

const getRandomMnemonicWords = () => bip39.generateMnemonic()
const validateMnemonicWords = (mnemonic) => bip39.validateMnemonic(mnemonicUtils.convertMnemonicToValid(mnemonic))


const sweepToMnemonic = (mnemonic, path) => {
  const wallet = getWalletByWords(mnemonic, path)
  localStorage.setItem(constants.privateKeyNames.ghostMnemonic, wallet.WIF)
  return wallet.WIF
}

const getMainPublicKey = () => {
  const {
    user: {
      ghostData,
    },
  } = getState()

  return ghostData.publicKey.toString('Hex')
}

const isSweeped = () => {
  const {
    user: {
      ghostData,
      ghostMnemonicData,
    },
  } = getState()

  if (ghostMnemonicData
    && ghostMnemonicData.address
    && ghostData
    && ghostData.address
    && ghostData.address.toLowerCase() !== ghostMnemonicData.address.toLowerCase()
  ) return false

  return true
}

const getSweepAddress = () => {
  const {
    user: {
      ghostMnemonicData,
    },
  } = getState()

  if (ghostMnemonicData && ghostMnemonicData.address) return ghostMnemonicData.address
  return false
}

const getWalletByWords = (mnemonic: string, walletNumber: number = 0, path: string = '') => {
  return mnemonicUtils.getGhostWallet(ghost.network, mnemonic, walletNumber, path)
}


const auth = (privateKey) => {
  if (privateKey) {
    const hash = bitcoin.crypto.sha256(privateKey)
    const d = BigInteger.fromBuffer(hash)

    const keyPair = bitcoin.ECPair.fromWIF(privateKey, ghost.network)

    const account = bitcoin.ECPair.fromWIF(privateKey, ghost.network) // eslint-disable-line
    const { address } = bitcoin.payments.p2pkh({ pubkey: account.publicKey, network: ghost.network })
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
      ghostData: {
        address: oldAddress,
        privateKey,
      }
    },
  } = getState()
  /*
  const ghostMnemonicData
      ghostMnemonicData: {
        address: mnemonicAddress,
        privateKey: mnemonicKey,
      },
    },
  } = getState()
  */
  if (oldAddress === address) return privateKey
    //@ts-ignore
  if (mnemonicAddress === address) return mnemonicKey
}

const login = (privateKey, mnemonic = null, mnemonicKeys = null) => {
  let sweepToMnemonicReady = false

  if (privateKey
    && mnemonic
    && mnemonicKeys
    && mnemonicKeys.ghost === privateKey
  ) sweepToMnemonicReady = true

  if (!privateKey && mnemonic) sweepToMnemonicReady = true

  if (privateKey) {
    const hash = bitcoin.crypto.sha256(privateKey)
    const d = BigInteger.fromBuffer(hash)

    // keyPair     = bitcoin.ECPair.fromWIF(privateKey, ghost.network)
  }
  else {
    console.info('Created account Ghost ...')
    // keyPair     = bitcoin.ECPair.makeRandom({ network: ghost.network })
    // privateKey  = keyPair.toWIF()
    // use random 12 words
    if (!mnemonic) mnemonic = bip39.generateMnemonic()

    const accData = getWalletByWords(mnemonic)
    console.log('Ghost. Generated wallet from random 12 words')
    console.log(accData)
    privateKey = accData.WIF
    localStorage.setItem(constants.privateKeyNames.ghostMnemonic, privateKey)
  }

  localStorage.setItem(constants.privateKeyNames.ghost, privateKey)

  const data = {
    ...auth(privateKey),
    isMnemonic: sweepToMnemonicReady,
    currency: 'GHOST',
    fullName: 'ghost',
  }

  window.getGhostAddress = () => data.address
  window.getGhostData = () => data

  console.info('Logged in with Ghost', data)
  reducers.user.setAuthData({ name: 'ghostData', data })
  if (!sweepToMnemonicReady) {
    // Auth with our mnemonic account
    if (mnemonic === `-`) {
      console.error('Sweep. Cant auth. Need new mnemonic or enter own for re-login')
      return
    }

    if (!mnemonicKeys
      || !mnemonicKeys.ghost
    ) {
      console.error('Sweep. Cant auth. Login key undefined')
      return
    }

    const mnemonicData = {
      ...auth(mnemonicKeys.ghost),
      isMnemonic: true,
    }
    console.info('Logged in with Ghost Mnemonic', mnemonicData)
    reducers.user.addWallet({
      name: 'ghostMnemonicData',
      data: {
        currency: 'GHOST',
        fullName: 'Ghost (New)',
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
          name: 'ghostMnemonicData',
          data: {
            //@ts-ignore
            ...balanceData,
            isBalanceFetched: true,
          },
        })
      } else {
        reducers.user.setBalanceError({ name: 'ghostMnemonicData' })
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

const getTxRouter = (txId) => `/ghost/tx/${txId}`

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
  const { user: { ghostData: { address } } } = getState()

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
    console.log('GHOST Balance: ', balance)
    console.log('GHOST unconfirmedBalance Balance: ', unconfirmedBalance)
    reducers.user.setBalance({ name: 'ghostData', amount: balance, unconfirmedBalance })
    return balance
  })
    .catch((e) => {
      reducers.user.setBalanceError({ name: 'ghostData' })
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
    fees: new BigNumber(fees).multipliedBy(1e8),
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
    //@ts-ignore
    .then(({ vin, vout, ...rest }) => {
      const senderAddress = vin ? vin[0].addr : null
      const amount = vout ? new BigNumber(vout[0].value).toNumber() : null

      let afterBalance = vout && vout[1] ? new BigNumber(vout[1].value).toNumber() : null
      let adminFee: any = false

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
        //@ts-ignore
        confirmed: !!(rest.confirmations),
        minerFee: rest.fees.dividedBy(1e8).toNumber(),
        adminFee,
        minerFeeCurrency: 'GHOST',
        outputs: vout.map((out) => ({
          amount: new BigNumber(out.value).toNumber(),
          address: out.scriptPubKey.addresses || null,
        })),
        ...rest,
      }

      return txInfo
    })

const getInvoices = (address) => {
  const { user: { ghostData: { userAddress } } } = getState()

  address = address || userAddress

  return actions.invoices.getInvoices({
    currency: 'GHOST',
    address,
  })
}

const getAllMyAddresses = () => {
  const {
    user: {
      ghostData,
      ghostMnemonicData,
      ghostMultisigSMSData,
      ghostMultisigUserData,
      ghostMultisigG2FAData,
      ghostMultisigPinData,
    },
  } = getState()

  const retData = []
  // Проверяем, был ли sweep
  if (ghostMnemonicData
    && ghostMnemonicData.address
    && ghostData
    && ghostData.address
    && ghostMnemonicData.address !== ghostData.address
  ) {
    retData.push(ghostMnemonicData.address.toLowerCase())
  }

  retData.push(ghostData.address.toLowerCase())

  if (ghostMultisigSMSData && ghostMultisigSMSData.address) retData.push(ghostMultisigSMSData.address.toLowerCase())
  // @ToDo - SMS MultiWallet

  if (ghostMultisigUserData && ghostMultisigUserData.address) retData.push(ghostMultisigUserData.address.toLowerCase())
  if (ghostMultisigUserData && ghostMultisigUserData.wallets && ghostMultisigUserData.wallets.length) {
    ghostMultisigUserData.wallets.map((wallet) => {
      retData.push(wallet.address.toLowerCase())
    })
  }

  if (ghostMultisigPinData && ghostMultisigPinData.address) retData.push(ghostMultisigPinData.address.toLowerCase())

  return retData
}

const getDataByAddress = (address) => {
  const {
    user: {
      ghostData,
      ghostMnemonicData,
      ghostMultisigSMSData,
      ghostMultisigUserData,
      ghostMultisigG2FAData,
    },
  } = getState()

  const founded = [
    ghostData,
    ghostMnemonicData,
    ghostMultisigSMSData,
    ghostMultisigUserData,
    ...(
      ghostMultisigUserData
      && ghostMultisigUserData.wallets
      && ghostMultisigUserData.wallets.length
    )
      ? ghostMultisigUserData.wallets
      : [],
    ghostMultisigG2FAData,
  ].filter(data => data && data.address && data.address.toLowerCase() === address.toLowerCase())

  return (founded.length) ? founded[0] : false
}

const getTransaction = (address, ownType) =>
  new Promise((resolve) => {
    const myAllWallets = getAllMyAddresses()

    let { user: { ghostData: { address: userAddress } } } = getState()
    address = address || userAddress

    const type = (ownType) || 'ghost'

    if (!typeforce.isCoinAddress.GHOST(address)) {
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
      query: 'ghost_balance',
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

const send = (data) => {
  return sendBitcore(data)
}

//@ts-ignore
const sendV5WithAdminFee = async ({ from, to, amount, feeValue, speed } = {}) => {
  const privateKey = getPrivateKeyByAddress(from)
  const keyPair = bitcoin.ECPair.fromWIF(privateKey, ghost.network)
  const {
    fee: adminFee,
    address: adminFeeAddress,
    min: adminFeeMinValue,
  } = config.opts.fee.ghost

  const adminFeeMin = new BigNumber(adminFeeMinValue)
  feeValue = feeValue || await ghost.estimateFeeValue({
    inSatoshis: true,
    speed
  })


  // fee - from amount - percent

  let feeFromAmount: number | BigNumber = new BigNumber(adminFee).dividedBy(100).multipliedBy(amount)
  if (adminFeeMin.isGreaterThan(feeFromAmount)) feeFromAmount = adminFeeMin

  feeFromAmount = feeFromAmount.multipliedBy(1e8).integerValue().toNumber()

  const unspents = await fetchUnspents(from)
  const fundValue = new BigNumber(String(amount)).multipliedBy(1e8).integerValue().toNumber()
  const totalUnspent = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)

  const skipValue = totalUnspent - fundValue - feeValue - feeFromAmount


  const psbt = new bitcoin.Psbt({ network: ghost.network })

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
    //@ts-ignore
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
//@ts-ignore
const sendWithAdminFee = async ({ from, to, amount, feeValue, speed } = {}) => {

  const {
    fee: adminFee,
    address: adminFeeAddress,
    min: adminFeeMinValue,
  } = config.opts.fee.ghost

  const adminFeeMin = new BigNumber(adminFeeMinValue)

  // fee - from amount - percent

  let feeFromAmount = new BigNumber(adminFee).dividedBy(100).multipliedBy(amount)
  if (adminFeeMin.isGreaterThan(feeFromAmount)) feeFromAmount = adminFeeMin

  feeFromAmount = feeFromAmount.multipliedBy(1e8).integerValue() // Admin fee in satoshi
  feeValue = feeValue || await ghost.estimateFeeValue({ inSatoshis: true, speed })

  const tx = new bitcoin.TransactionBuilder(ghost.network)
  const unspents = await fetchUnspents(from)

  let fundValue = new BigNumber(String(amount)).multipliedBy(1e8).integerValue().toNumber()

  const totalUnspent = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
  //@ts-ignore
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

//@ts-ignore
const sendV5Default = async ({ from, to, amount, feeValue, speed } = {}) => {
  const privateKey = getPrivateKeyByAddress(from)
  const keyPair = bitcoin.ECPair.fromWIF(privateKey, ghost.network)
  
  let feeFromAmount = new BigNumber(0)
  if (hasAdminFee) {
    const {
      fee: adminFee,
      min: adminFeeMinValue,
    } = config.opts.fee.btc

    const adminFeeMin = new BigNumber(adminFeeMinValue)
    feeFromAmount = new BigNumber(adminFee).dividedBy(100).multipliedBy(amount)
    if (adminFeeMin.isGreaterThan(feeFromAmount)) feeFromAmount = adminFeeMin
    //@ts-ignore
    feeFromAmount = feeFromAmount.multipliedBy(1e8).integerValue().toNumber() // Admin fee in satoshi
  }

  feeValue = feeValue || await ghost.estimateFeeValue({ inSatoshis: true, speed })

  const unspents = await fetchUnspents(from)
  const fundValue = new BigNumber(String(amount)).multipliedBy(1e8).integerValue().toNumber()
  const totalUnspent = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
  //@ts-ignore
  const skipValue = totalUnspent - fundValue - feeValue - feeFromAmount

  const psbt = new bitcoin.Psbt({ network: ghost.network })
  
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
  return txid
}
//@ts-ignore
const sendDefault = async ({ from, to, amount, feeValue, speed } = {}) => {
  feeValue = feeValue || await ghost.estimateFeeValue({ inSatoshis: true, speed })
  const tx = new bitcoin.TransactionBuilder(ghost.network)
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
//@ts-ignore
const sendBitcore = ({ from, to, amount, feeValue, speed } = {}) => {
  return new Promise(async (ready) => {
    const privKey = getPrivateKeyByAddress(from)
    const unspents = await fetchUnspents(from)
    const fundValue = new BigNumber(String(amount)).multipliedBy(1e8).integerValue().toNumber()

    const transaction = new bitcore.Transaction()
          .from(unspents)          // Feed information about what unspent outputs one can use
          .to(to, fundValue)  // Add an output with the given amount of satoshis
          .change(from)      // Sets up a change address where the rest of the funds will go
          .sign(privKey)     // Signs all the inputs it can*/


    const broadcastAnswer = await broadcastTx(String(transaction.serialize()))

    const { txid } = broadcastAnswer
    ready(txid)
  })
}

const signAndBuild = (transactionBuilder, address) => {
  let { user: { ghostData: { privateKey } } } = getState()

  if (address) {
    // multi wallet - sweep upgrade
    privateKey = getPrivateKeyByAddress(address)
  } else {
    // single wallet - use ghostData
  }

  const keyPair = bitcoin.ECPair.fromWIF(privateKey, ghost.network)

  transactionBuilder.__INPUTS.forEach((input, index) => {
    transactionBuilder.sign(index, keyPair)
  })
  return transactionBuilder.buildIncomplete()
}

const fetchUnspents = (address) => {
  const result: any = apiLooper.get('ghostscan', `/addr/${address}/utxo`, { cacheResponse: 5000 })
  return result
}

const broadcastTx = (txRaw) => {
  const result: any = apiLooper.post('ghostscan', `/tx/send`, {
    body: {
      rawtx: txRaw,
    },
  })
  return result
}

const signMessage = (message, encodedPrivateKey) => {
  const keyPair = bitcoin.ECPair.fromWIF(encodedPrivateKey, [ghost.networks.mainnet, ghost.networks.testnet])
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
    query: 'ghost_balance',
  }).then((res: any) => {
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

window.ghostCheckWithdraw = checkWithdraw

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
