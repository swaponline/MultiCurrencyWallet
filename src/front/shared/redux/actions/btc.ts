import BigInteger from 'bigi'

import * as bitcoin from 'bitcoinjs-lib'
import * as bip39 from 'bip39'

import bitcoinMessage from 'bitcoinjs-message'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import { btc, apiLooper, constants, api } from 'helpers'
import actions from 'redux/actions'
import typeforce from 'swap.app/util/typeforce'
import config from 'app-config'

import * as mnemonicUtils from 'common/utils/mnemonic'

import { default as bitcoinUtils } from 'common/utils/coin/btc'


const NETWORK = (process.env.MAINNET) ? `MAINNET` : `TESTNET`


const hasAdminFee = (config
  && config.opts
  && config.opts.fee
  && config.opts.fee.btc
  && config.opts.fee.btc.fee
  && config.opts.fee.btc.address
  && config.opts.fee.btc.min
) ? config.opts.fee.btc : false


const getMainPublicKey = () => {
  const {
    user: {
      btcData,
    },
  } = getState()

  return btcData.publicKey.toString('Hex')
}

const getWalletByWords = (mnemonic: string, walletNumber: number = 0, path: string = '') => {
  return mnemonicUtils.getBtcWallet(btc.network, mnemonic, walletNumber, path)
}

const auth = (privateKey) => {
  if (privateKey) {
    try {
      const account = bitcoin.ECPair.fromWIF(privateKey, btc.network)
      const { address } = bitcoin.payments.p2pkh({ pubkey: account.publicKey, network: btc.network })
      const { publicKey } = account

      return {
        account,
        keyPair: account,
        address,
        privateKey,
        publicKey,
      }
    } catch (error) {
      console.log('btc auth', error, btc.network)
    }
  }
}

const getPrivateKeyByAddress = (address) => {
  const {
    user: {
      btcData: {
        address: dataAddress,
        privateKey,
      },
    },
  } = getState()

  if (dataAddress === address) return privateKey
}

const login = (
  privateKey,
  mnemonic: string | null = null,
) => {

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
    //@ts-ignore: strictNullChecks
    if (!mnemonic) mnemonic = bip39.generateMnemonic()

    //@ts-ignore: strictNullChecks
    const accData = getWalletByWords(mnemonic)

    privateKey = accData.WIF
  }

  localStorage.setItem(constants.privateKeyNames.btc, privateKey)

  const data = {
    ...auth(privateKey),
    isBTC: true,
  }

  window.getBtcAddress = () => data.address
  window.getBtcData = () => data

  reducers.user.setAuthData({ name: 'btcData', data })

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

const fetchTxInfo = (hash, cacheResponse, serviceFee = null) => bitcoinUtils.fetchTxInfo({
  hash,
  NETWORK,
  cacheResponse,
  hasAdminFee: serviceFee || hasAdminFee,
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
      btcMultisigSMSData,
      btcMultisigUserData,
      btcMultisigPinData,
    },
  } = getState()

  const retData = []

  //@ts-ignore: strictNullChecks
  retData.push(btcData.address.toLowerCase())

  //@ts-ignore: strictNullChecks
  if (btcMultisigSMSData?.address) retData.push(btcMultisigSMSData.address.toLowerCase())
  // @ToDo - SMS MultiWallet

  //@ts-ignore: strictNullChecks
  if (btcMultisigUserData?.address) retData.push(btcMultisigUserData.address.toLowerCase())
  if (btcMultisigUserData?.wallets?.length) {
    btcMultisigUserData.wallets.map((wallet) => {
      //@ts-ignore: strictNullChecks
      retData.push(wallet.address.toLowerCase())
    })
  }

  //@ts-ignore: strictNullChecks
  if (btcMultisigPinData?.address) retData.push(btcMultisigPinData.address.toLowerCase())

  return retData
}

const getDataByAddress = (address) => {
  const {
    user: {
      btcData,
      btcMultisigSMSData,
      btcMultisigUserData,
      btcMultisigG2FAData,
    },
  } = getState()

  const founded = [
    btcData,
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

const addressIsCorrect = (address) => {
  try {
    let outputScript = bitcoin.address.toOutputScript(address, btc.network)
    if (outputScript) return true
  } catch (e) {}
  return false
}


const send = (params) => {
  const {
    from,
    to,
    amount,
    feeValue,
    speed, 
    serviceFee = hasAdminFee,
  } = params

  return new Promise(async (ready, reject) => {
    try {
      let privateKey = null
      try {
        privateKey = getPrivateKeyByAddress(from)
      } catch (ePrivateKey) {
        reject({ message: `Fail get data for send address` + ePrivateKey.message })
      }

      let preparedFees

      try {
        preparedFees = await bitcoinUtils.prepareFees({
          amount,
          serviceFee,
          feeValue,
          speed,
          from,
          to,
          NETWORK
        })
      } catch (prepareFeesError) {
        reject({ message: `Fail prepare fees: ${prepareFeesError.message}` })
      }
      const {
        fundValue,
        skipValue,
        feeFromAmount,
        unspents,
      } = preparedFees

      let rawTx
      try {
        rawTx = await bitcoinUtils.prepareRawTx({
          from,
          to,
          fundValue,
          skipValue,
          serviceFee,
          feeFromAmount,
          unspents,
          privateKey,
          network: btc.network,
          NETWORK
        })
      } catch (prepareRawTxError) {
        reject({ message: `Fail prepare raw tx: ${prepareRawTxError.message}` })
      }

      try {
        const broadcastAnswer = await broadcastTx(rawTx)

        const { txid } = broadcastAnswer
        ready(txid)
      } catch (eBroadcast) {
        reject({ message: `Fail broadcast TX: `+eBroadcast })
      }
    } catch (error) {
      console.log('Actions - btc - send: ', error)
      reject(error)
    }
  })
}

const sendTransaction = async ({ to, amount }) => {
  // from main btc wallet

  const { user: { btcData: { address } } } = getState()

  if (false) { // fake tx - turboswaps debug
    const txHash = '1324154f6086b6b137be8763f43096cacd5450f9561da061161638ed68ce39c3'
    return txHash
  }

  const txHash = await send({
    from: address,
    to,
    amount,
    speed: 'fast',
  })

  return txHash
}

const prepareUnspents = ({ amount, unspents }) => bitcoinUtils.prepareUnspents({
  amount,
  unspents,
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
  //@ts-ignore: strictNullChecks
  const privateKeyBuff = Buffer.from(keyPair.privateKey)

  const signature = bitcoinMessage.sign(message, privateKeyBuff, keyPair.compressed)

  return signature.toString('base64')
}

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
  sendTransaction,
  fetchUnspents,
  broadcastTx,
  fetchTx,
  fetchTxInfo,
  fetchBalance,
  signMessage,
  getTx,
  getLinkToInfo,
  getInvoices,
  getWalletByWords,
  getAllMyAddresses,
  getDataByAddress,
  getMainPublicKey,
  getTxRouter,
  fetchTxRaw,
  addressIsCorrect,
  prepareUnspents,
}
