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
import typeforce from "swap.app/util/typeforce"
import config from 'app-config'

import { localisePrefix } from 'helpers/locale'



const getRandomMnemonicWords = () => bip39.generateMnemonic()
const validateMnemonicWords = (mnemonic) => bip39.validateMnemonic(mnemonic)


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

const getWalletByWords = (mnemonic, walletNumber = 0, path) => {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed, btc.network);
  const node = root.derivePath((path) ? path : `m/44'/0'/0'/0/${walletNumber}`)

  const account = bitcoin.payments.p2pkh({
    pubkey: node.publicKey,
    network: btc.network,
  })

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
      }
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
    && mnemonicKeys.btc === privateKey
  ) sweepToMnemonicReady = true

  if (!privateKey && mnemonic) sweepToMnemonicReady = true

  if (privateKey) {
    const hash = bitcoin.crypto.sha256(privateKey)
    const d = BigInteger.fromBuffer(hash)

    //keyPair     = bitcoin.ECPair.fromWIF(privateKey, btc.network)
  }
  else {
    console.info('Created account Bitcoin ...')
    //keyPair     = bitcoin.ECPair.makeRandom({ network: btc.network })
    //privateKey  = keyPair.toWIF()
    // use random 12 words
    if (!mnemonic) mnemonic = bip39.generateMnemonic()
    const accData = getWalletByWords(mnemonic)
    console.log('Btc. Generated walled from random 12 words')
    console.log(accData)
    privateKey = accData.WIF
    localStorage.setItem(constants.privateKeyNames.btcMnemonic, privateKey)
  }

  localStorage.setItem(constants.privateKeyNames.btc, privateKey)

  const data = {
    ...auth(privateKey),
    isMnemonic: sweepToMnemonicReady,
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
      }
    })
    new Promise(async (resolve) => {
      const balanceData = await fetchBalanceStatus(mnemonicData.address)
      if (balanceData) {
        reducers.user.setAuthData({
          name: 'btcMnemonicData',
          data: {
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



const getTx = (txRaw) => {

  return txRaw.getId()
}

const getTxRouter = (txId) => {
  return `/btc/tx/${txId}`
}

const getLinkToInfo = (tx) => {

  if (!tx) {
    return
  }

  return `${config.link.bitpay}/tx/${tx}`
}

const fetchBalanceStatus = (address) => {
  return apiLooper.get('bitpay', `/addr/${address}`, {
    checkStatus: (answer) => {
      try {
        if (answer && answer.balance !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
  }).then(({ balance, unconfirmedBalance }) => {
    return {
      address,
      balance,
      unconfirmedBalance,
    }
  })
    .catch((e) => {
      return false
    })
}
const getBalance = () => {
  const { user: { btcData: { address } } } = getState()

  return apiLooper.get('bitpay', `/addr/${address}`, {
    inQuery: {
      delay:  500,
      name: `balance`,
    },
    checkStatus: (answer) => {
      try {
        if (answer && answer.balance !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
  }).then(({ balance, unconfirmedBalance }) => {
    console.log('BTC Balance: ', balance)
    console.log('BTC unconfirmedBalance Balance: ', unconfirmedBalance)
    reducers.user.setBalance({ name: 'btcData', amount: balance, unconfirmedBalance })
    return balance
  })
    .catch((e) => {
      reducers.user.setBalanceError({ name: 'btcData' })
    })
}

const fetchBalance = (address) =>
  apiLooper.get('bitpay', `/addr/${address}`, {
    checkStatus: (answer) => {
      try {
        if (answer && answer.balance !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
  }).then(({ balance }) => balance)

const fetchTx = (hash, cacheResponse) =>
  apiLooper.get('bitpay', `/tx/${hash}`, {
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

const fetchTxInfo = (hash, cacheResponse) =>
  fetchTx(hash, cacheResponse)
    .then(({ vin, vout, ...rest }) => ({
      amount: vout ? new BigNumber(vout[0].value).toNumber() : null,
      afterBalance: vout && vout[1] ? new BigNumber(vout[1].value).toNumber() : null,
      senderAddress: vin ? vin[0].addr : null,
      receiverAddress: vout ? vout[0].scriptPubKey.addresses : null,
      confirmed: (rest.confirmations) ? true : false,
      minerFee: rest.fees.dividedBy(1e8).toNumber(),
      minerFeeCurrency: 'BTC',
      ...rest,
    }))

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

  // @ToDo - add btcMultisigG2FAData process
  /*
  if (btcData && btcData.address && btcData.address.toLowerCase() === address.toLowerCase()) return btcData
  if (btcMnemonicData && btcMnemonicData.address && btcMnemonicData.address.toLowerCase() === address.toLowerCase()) return btcMnemonicData // Sweep
  if (btcMultisigSMSData && btcMultisigSMSData.address && btcMultisigSMSData.address.toLowerCase() === address.toLowerCase()) return btcMultisigSMSData
  if (btcMultisigUserData && btcMultisigUserData.address && btcMultisigUserData.address.toLowerCase() === address.toLowerCase()) return btcMultisigUserData
  if (btcMultisigG2FAData && btcMultisigG2FAData.address && btcMultisigG2FAData.address.toLowerCase() === address.toLowerCase()) return btcMultisigG2FAData
*/
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

const getTransaction = (address, ownType) =>
  new Promise((resolve) => {
    const myAllWallets = getAllMyAddresses()

    console.log('btc getTransaction', address, myAllWallets)
    let { user: { btcData: { address: userAddress } } } = getState()
    address = address || userAddress

    const type = (ownType) ? ownType : 'btc'

    if (!typeforce.isCoinAddress['BTC'](address)) {
      resolve([])
    }

    const url = `/txs/?address=${address}`
    return apiLooper.get('bitpay', url, {
      checkStatus: (answer) => {
        try {
          if (answer && answer.txs !== undefined) return true
        } catch (e) { /* */ }
        return false
      },
      query: 'btc_balance',
    }).then((res) => {
      console.log('getTransaction', address, res)
      const transactions = res.txs.map((item) => {
        const direction = item.vin[0].addr !== address ? 'in' : 'out'
        console.log(direction)
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

const send = async ({ from, to, amount, feeValue, speed } = {}) => {
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

const fetchUnspents = (address) =>
  apiLooper.get('bitpay', `/addr/${address}/utxo`, { cacheResponse: 5000 })

const broadcastTx = (txRaw) =>
  apiLooper.post('bitpay', `/tx/send`, {
    body: {
      rawtx: txRaw,
    },
  })

const signMessage = (message, encodedPrivateKey) => {
  const keyPair = bitcoin.ECPair.fromWIF(encodedPrivateKey, [bitcoin.networks.bitcoin, bitcoin.networks.testnet])
  const privateKeyBuff = Buffer.from(keyPair.privateKey)

  const signature = bitcoinMessage.sign(message, privateKeyBuff, keyPair.compressed)

  return signature.toString('base64')
}

const getReputation = () => Promise.resolve(0)

window.getMainPublicKey = getMainPublicKey

export default {
  login,
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
}
