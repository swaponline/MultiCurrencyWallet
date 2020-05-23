import BigInteger from 'bigi'

import { BigNumber } from 'bignumber.js'
import * as bitcoin from 'bitcoinjs-lib'
import bitcoinMessage from 'bitcoinjs-message'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import { apiLooper, constants, api } from 'helpers'
import btc from 'helpers/btc'
import actions from 'redux/actions'
import config from 'helpers/externalConfig'
import SwapApp from 'swap.app'


const hasAdminFee = (
  config
  && config.opts
  && config.opts.fee
  && config.opts.fee.btc
  && config.opts.fee.btc.fee
  && config.opts.fee.btc.address
  && config.opts.fee.btc.min
) ? config.opts.fee.btc : false

const addressToWallet = (address) => {
  const {
    user: {
      btcMultisigUserData: msData,
    },
  } = getState()

  if (msData.address === address) return msData

  if (msData.wallets
    && msData.wallets.length
  ) {
    const founded = msData.wallets.filter((wallet) => wallet.address === address)
    if (founded.length) return founded[0]
  }

  return false
}

const getSmsKeyFromMnemonic = (mnemonic) => {
  if (mnemonic) {
    const mnemonicWallet = actions.btc.getWalletByWords(mnemonic, 1)
    if (mnemonicWallet) {
      return mnemonicWallet.publicKey
    }
  }
}

const _loadBtcMultisigKeys = () => {
  let savedKeys = localStorage.getItem(constants.privateKeyNames.btcMultisigOtherOwnerKey)
  try { savedKeys = JSON.parse(savedKeys) } catch (e) { }

  if (!(savedKeys instanceof Array)) savedKeys = [savedKeys]

  return savedKeys
}

const delay = (ms) => new Promise(resolve => setTimeout(() => resolve(true), ms))

const signToUserMultisig = async () => {
  const {
    user: {
      btcMultisigUserData,
      btcMultisigUserData: {
        infoAboutCurrency,
      },
    },
  } = getState()

  const walletAddreses = []

  const walletsData = await getBtcMultisigKeys({
    opts: {
      dontFetchBalance: true,
    }
  })

  const wallets = walletsData.map((data) => {

    return {
      address: data.address,
      currency: `BTC (Multisig)`,
      fullName: `Bitcoin (Multisig)`,
      infoAboutCurrency,
      isUserProtected: true,
      active: true,
      balance: 0,
      unconfirmedBalance: 0,
      isBalanceFetched: false,
      balanceError: false,
      publicKeys: data.publicKeys,
      publicKey: data.publicKey,
    }
  }).filter((wallet) => wallet.address !== btcMultisigUserData.address)

  btcMultisigUserData.wallets = wallets

  reducers.user.setAuthData({ name: 'btcMultisigUserData', data: btcMultisigUserData })

  fetchMultisigBalances()
}

const fetchMultisigBalances = () => {
  const {
    user: {
      btcMultisigUserData: {
        wallets,
      }
    },
  } = getState()

  if (wallets && wallets.length) {
    wallets.map(({ address }, index) => {
      return new Promise(async (resolve) => {
        getAddrBalance(address).then(({ balance, unconfirmedBalance }) => {
          reducers.user.setBtcMultisigBalance({
            address,
            amount: balance,
            isBalanceFetched: true,
            unconfirmedBalance,
          })
          resolve({ address, balance, unconfirmedBalance })
        }).catch((e) => {
          // 
        })
      })
    })
  }
}

const getBtcMultisigKeys = (params) => {
  let opts = {}
  if (params && params.opts) opts = params.opts

  return new Promise(async (resolve, reject) => {
    const { user: { btcMultisigUserData } } = getState()
    const { privateKey } = btcMultisigUserData

    const savedKeys = _loadBtcMultisigKeys()
    const keysInfo = []
    if (savedKeys.length > 0) {
      for (var i = 0; i < savedKeys.length; i++) {
        if (savedKeys[i]) {
          const walletData = login_USER(privateKey, savedKeys[i], true)

          walletData.index = i
          walletData.balance = (opts.dontFetchBalance) ? 0 : await fetchBalance(walletData.address)
          keysInfo.push(walletData)
        }
      }
    }

    resolve(keysInfo)
  })
}

const addBtcMultisigKey = (publicKey, isPrimary) => {
  const savedKeys = _loadBtcMultisigKeys()

  if (!savedKeys.includes(publicKey)) {
    savedKeys.push(publicKey)
  }

  localStorage.setItem(constants.privateKeyNames.btcMultisigOtherOwnerKey, JSON.stringify(savedKeys))

  if (isPrimary) switchBtcMultisigKey(publicKey)
}

const switchBtcMultisigKey = (keyOrIndex) => {
  const savedKeys = _loadBtcMultisigKeys()

  let index = keyOrIndex
  if (!Number.isInteger(index)) index = savedKeys.indexOf(keyOrIndex)

  if ((index > -1) && (index < savedKeys.length)) {
    if (index !== 0) {
      const newKey = savedKeys.splice(index, 1)
      savedKeys.unshift(newKey[0])
      localStorage.setItem(constants.privateKeyNames.btcMultisigOtherOwnerKey, JSON.stringify(savedKeys))

      const {
        user: {
          btcData: {
            privateKey,
          },
        },
      } = getState()

      login_USER(privateKey, newKey[0])
      getBalanceUser()
    }
  }
}

const removeBtcMultisigNey = (keyOrIndex) => {
  const savedKeys = _loadBtcMultisigKeys()

  let index = keyOrIndex
  if (!Number.isInteger(index)) index = savedKeys.indexOf(keyOrIndex)

  if (index > -1) {
    const newKey = savedKeys.splice(index, 1)

    localStorage.setItem(constants.privateKeyNames.btcMultisigOtherOwnerKey, JSON.stringify(savedKeys))

    if (index === 0) {
      switchBtcMultisigKey(0)
      return true
    }
  }
}


const addWallet = (otherOwnerPublicKey) => {
  const { user: { btcMultisigSMSData: { address, privateKey } } } = getState()
  createWallet(privateKey, otherOwnerPublicKey)
}

const checkSMSActivated = () => {
  const { user: { btcMultisigSMSData: { isRegistered } } } = getState()
  return isRegistered
}

const checkG2FAActivated = () => {
  return false
}

const checkUserActivated = () => {
  const { user: { btcMultisigUserData: { active } } } = getState()
  return active
}

const isBTCSMSAddress = (address) => {
  const {
    user: {
      btcData,
      btcMultisigSMSData,
    },
  } = getState()

  if (btcMultisigSMSData && btcMultisigSMSData.address && btcMultisigSMSData.address.toLowerCase() === address.toLowerCase()) return btcMultisigSMSData

  return false
}

const isBTCMSUserAddress = (address) => {
  const {
    user: {
      btcMultisigUserData: msData,
    },
  } = getState()

  if (msData.address === address) return true

  if (msData.wallets
    && msData.wallets.length
  ) {
    const founded = msData.wallets.filter((wallet) => wallet.address === address)
    if (founded.length) return true
  }

  return false
}

// @ToDo - Remove.
const isBTCAddress = (address) => {
  console.warn(`Deprecated call isBTCAddress`)
  return actions.btc.getDataByAddress(address)

  const {
    user: {
      btcData,
      btcMnemonicData,
      btcMultisigSMSData,
      btcMultisigUserData,
      btcMultisigG2FAData,
    },
  } = getState()

  if (btcData && btcData.address && btcData.address.toLowerCase() === address.toLowerCase()) return btcData
  if (btcMnemonicData && btcMnemonicData.address && btcMnemonicData.address.toLowerCase() === address.toLowerCase()) return btcMnemonicData // Sweep
  if (btcMultisigSMSData && btcMultisigSMSData.address && btcMultisigSMSData.address.toLowerCase() === address.toLowerCase()) return btcMultisigSMSData
  if (btcMultisigUserData && btcMultisigUserData.address && btcMultisigUserData.address.toLowerCase() === address.toLowerCase()) return btcMultisigUserData
  if (btcMultisigG2FAData && btcMultisigG2FAData.address && btcMultisigG2FAData.address.toLowerCase() === address.toLowerCase()) return btcMultisigG2FAData

  return false
}

const createWallet = (privateKey, otherOwnerPublicKey) => {
  // privateKey - key of our privary one-sign btc wallet
  let keyPair

  if (privateKey) {
    const hash = bitcoin.crypto.sha256(privateKey)
    const d = BigInteger.fromBuffer(hash)

    keyPair = bitcoin.ECPair.fromWIF(privateKey, btc.network)
  }
  else {
    console.error('Requery privateKey')
    return false
  }


  const account = bitcoin.ECPair.fromWIF(privateKey, btc.network) // eslint-disable-line
  const { addressOfMyOwnWallet } = bitcoin.payments.p2wpkh({ pubkey: account.publicKey, network: btc.network })
  const { publicKey } = account

  const publicKeysRaw = [otherOwnerPublicKey, account.publicKey.toString('hex')].sort().reverse()

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

const login_SMS = (privateKey, otherOwnerPublicKey) => {
  const data = login_(privateKey, otherOwnerPublicKey, false)

  if (!data) return false

  const isRegistered = (localStorage.getItem(`${constants.localStorage.didProtectedBtcCreated}:${data.address}`) === '1')

  data.currency = 'BTC (SMS-Protected)'
  data.fullName = 'Bitcoin (SMS-Protected)'
  data.isRegistered = (otherOwnerPublicKey instanceof Array && otherOwnerPublicKey.length > 1) ? true : isRegistered
  data.isSmsProtected = true

  reducers.user.setAuthData({ name: 'btcMultisigSMSData', data })
}

const login_G2FA = (privateKey, otherOwnerPublicKey) => {
  const data = login_(privateKey, otherOwnerPublicKey, false)

  if (!data) return false

  const isRegistered = (localStorage.getItem(`${constants.localStorage.didProtectedBtcG2FACreated}:${data.address}`) === '1')

  data.currency = 'BTC (Google 2FA)'
  data.fullName = 'Bitcoin (Google 2FA)'
  data.isRegistered = isRegistered
  data.isG2FAProtected = true

  reducers.user.setAuthData({ name: 'btcMultisigG2FAData', data })
}

const login_USER = (privateKey, otherOwnerPublicKey, onlyCheck) => {
  if (otherOwnerPublicKey instanceof Array && otherOwnerPublicKey.length === 0) return

  const data = login_(privateKey, (otherOwnerPublicKey instanceof Array) ? otherOwnerPublicKey[0] : otherOwnerPublicKey, true)

  if (!data) return false

  data.isUserProtected = true
  if (onlyCheck) return data

  reducers.user.setAuthData({ name: 'btcMultisigUserData', data })

  // Setup IPFS sign request
  actions.ipfs.onReady(() => {
    const { user: { btcMultisigUserData: { address } } } = getState()
    const onRequestEventName = `btc multisig request sign ${address}`
    SwapApp.shared().services.room.subscribe(onRequestEventName, (_data) => {
      const { txData } = _data
      if (txData && txData.address && txData.amount && txData.currency && txData.txRaw) {
        SwapApp.shared().services.room.sendMessagePeer(
          _data.fromPeer,
          {
            event: `btc multisig accept tx ${address}`,
            data: {}
          }
        )
        actions.notifications.show('BTCMultisignRequest', txData)
        actions.modals.open(constants.modals.BtcMultisignConfirmTx, {
          txData: txData.txRaw,
        })
      }
    })
  })
}

const login_ = (privateKey, otherOwnerPublicKey, sortKeys) => {
  let keyPair

  if (privateKey) {
    const hash = bitcoin.crypto.sha256(privateKey)
    const d = BigInteger.fromBuffer(hash)

    keyPair = bitcoin.ECPair.fromWIF(privateKey, btc.network)
  }
  else {
    console.log('Requery privateKey')
    return false
  }


  const account = bitcoin.ECPair.fromWIF(privateKey, btc.network) // eslint-disable-line
  const { publicKey } = account
  const publicKey_1 = account.publicKey.toString('hex')

  // TODO - simple sort public keys by ABC - no primary and secondary
  let _data

  if (otherOwnerPublicKey) {
    let publicKeysRaw = []
    if (otherOwnerPublicKey instanceof Array) {
      otherOwnerPublicKey.forEach((key) => { publicKeysRaw.push(key) })
    } else {
      publicKeysRaw.push(otherOwnerPublicKey)
    }
    publicKeysRaw.push(publicKey_1)

    if (sortKeys) publicKeysRaw = publicKeysRaw.sort()

    const publicKeys = publicKeysRaw.map(hex => Buffer.from(hex, 'hex'))
    const p2ms = bitcoin.payments.p2ms({
      m: 2,
      n: publicKeysRaw.length,
      pubkeys: publicKeys,
      network: btc.network,
    })

    const p2sh = bitcoin.payments.p2sh({ redeem: p2ms, network: btc.network })
    const { address } = p2sh

    const { addressOfMyOwnWallet } = bitcoin.payments.p2wpkh({ pubkey: account.publicKey, network: btc.network })

    _data = {
      account,
      keyPair,
      p2sh,
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

const onUserMultisigJoin = (data) => {
  console.log('on user multisig join', data)
  const {
    user: {
      btcMultisigUserData,
      btcData,
    },
  } = getState()
  const { fromPeer, checkKey, publicKey } = data

  if (checkKey === btcData.publicKey.toString('hex') && publicKey && (publicKey.length === 66)) {
    console.log('checks ok - connect')
    addBtcMultisigKey(publicKey, true)
    SwapApp.shared().services.room.sendMessagePeer(fromPeer, {
      event: 'btc multisig join ready',
      data: {}
    })
  }
}

// Получили транзакцию из комнаты -  проверяем, наш это кошелек и если да. Записываем в историю транзакций с поменткой - нужно подтвердить
const onUserMultisigSend = (data) => {
  console.log('on user multisig send', data)
}

// Рассылает транзакцию в комнате, если второй владелец в сети. То он сразу увидит, что ему нужно подтвердить транзакцию без передачи ссылки
const broadcastTX2Room = (txData, cbSuccess, cbFail) => {
  const { user: { btcMultisigUserData: { publicKey, address } } } = getState()

  const onSuccessEventName = `btc multisig accept tx ${address}`
  let failTimer = false

  const onSuccessEvent = (data) => {
    console.log('broadcast sucess', data)
    clearTimeout(failTimer)
    SwapApp.shared().services.room.unsubscribe(onSuccessEventName, onSuccessEvent)
    if (cbSuccess) cbSuccess()
  }

  const cancelFunc = () => {
    console.log('broadcast multisig canceled')
    clearTimeout(failTimer)
    SwapApp.shared().services.room.unsubscribe(onSuccessEventName, onSuccessEvent)
  }

  const onFailTimer = () => {
    console.log('broadcast multisig fail timer')
    clearTimeout(failTimer)
    SwapApp.shared().services.room.unsubscribe(onSuccessEventName, onSuccessEvent)
    if (cbFail) cbFail()
  }

  failTimer = setTimeout(onFailTimer, 30000)

  SwapApp.shared().services.room.subscribe(onSuccessEventName, onSuccessEvent)

  // Broadcast TX
  SwapApp.shared().services.room.sendMessageRoom({
    event: `btc multisig request sign ${address}`,
    data: {
      txData,
      publicKey: publicKey.toString('hex')
    },
  })
  return cancelFunc
}

window.broadcastTX2Room = broadcastTX2Room

const _getSign = () => {
  const { user: { btcMultisigSMSData: { account, address, keyPair, publicKey } } } = getState()
  const message = `${address}:${publicKey.toString('hex')}`

  console.log(message)
  const sign = bitcoinMessage.sign(message, account.privateKey, keyPair.compressed)
  return sign.toString('base64')
}

const beginRegisterSMS = async (phone, mnemonic, ownPublicKey) => {
  const {
    user: {
      btcMultisigSMSData: {
        account,
        keyPair,
        publicKey
      },
      btcData: {
        address,
      },
    }
  } = getState()

  const publicKeys = []
  if (mnemonic && !ownPublicKey) {
    // 2of3 - extract public key from mnemonic
    const mnemonicAccount = actions.btc.getWalletByWords(mnemonic, 1)
    publicKeys.push(mnemonicAccount.publicKey)
  }

  // Возможность использовать произвольный публик-кей для разблокирования
  if (ownPublicKey) {
    publicKeys.push(ownPublicKey)
  }

  publicKeys.push(publicKey.toString('Hex'))

  const sign = _getSign()
  try {
    const result = await apiLooper.post('btc2FAProtected', `/register/begin/`, {
      body: {
        phone,
        address,
        publicKey: JSON.stringify(publicKeys),
        checkSign: sign,
        mainnet: process.env.MAINNET ? true : false,
      },
    })
    console.log(result)
    return result
  } catch (error) {
    console.error(error)
    return false
  }
}

const confirmRegisterSMS = async (phone, smsCode, mnemonic, ownPublicKey) => {
  const {
    user: {
      btcMultisigSMSData: {
        account,
        keyPair,
        publicKey,
      },
      btcData: {
        address,
      },
    },
  } = getState()

  const publicKeys = []
  let mnemonicKey = false

  if (mnemonic && !ownPublicKey) {
    // 2of3 - extract public key from mnemonic
    const mnemonicAccount = actions.btc.getWalletByWords(mnemonic, 1)
    mnemonicKey = mnemonicAccount.publicKey
    publicKeys.push(mnemonicKey)
  }

  // Возможность использовать произвольный публик-кей для разблокирования
  if (ownPublicKey) {
    publicKeys.push(ownPublicKey)
    mnemonicKey = ownPublicKey
  }

  publicKeys.push(publicKey.toString('Hex'))

  const sign = _getSign()

  const newKeys = JSON.stringify(publicKeys)

  try {
    const result = await apiLooper.post('btc2FAProtected', `/register/confirm/`, {
      body: {
        phone,
        address,
        smsCode,
        publicKey: newKeys,
        checkSign: sign,
        mainnet: process.env.MAINNET ? true : false,
      },
    })

    if ((result && result.answer && result.answer === 'ok') || (result.error === 'Already registered')) {
      localStorage.setItem(`${constants.localStorage.didProtectedBtcCreated}:${address}`, '1')
      if (mnemonic) {
        addSMSWallet(mnemonicKey)
      }
    }

    return result
  } catch (error) {
    console.error(error)
    return false
  }
}

const addSMSWallet = async (mnemonicOrKey) => {
  const {
    user: {
      btcData: {
        privateKey,
      },
    },
  } = getState()

  let mnemonicKey = mnemonicOrKey
  if (actions.btc.validateMnemonicWords(mnemonicOrKey)) {
    const mnemonicAccount = actions.btc.getWalletByWords(mnemonicOrKey, 1)
    mnemonicKey = mnemonicAccount.publicKey
  }

  let btcSmsMnemonicKey = localStorage.getItem(constants.privateKeyNames.btcSmsMnemonicKey)
  try { btcSmsMnemonicKey = JSON.parse(btcSmsMnemonicKey) } catch (e) { }
  if (!(btcSmsMnemonicKey instanceof Array)) {
    btcSmsMnemonicKey = []
  }

  const index = btcSmsMnemonicKey.indexOf(mnemonicKey)
  if (index === -1) btcSmsMnemonicKey.unshift(mnemonicKey)
  if ((index > -1) && (index < btcSmsMnemonicKey.length)) {
    if (index !== 0) {
      btcSmsMnemonicKey = btcSmsMnemonicKey.splice(index, 1)
      btcSmsMnemonicKey.unshift(mnemonicKey)
    }
  }

  localStorage.setItem(constants.privateKeyNames.btcSmsMnemonicKey, JSON.stringify(btcSmsMnemonicKey))

  const btcSMSServerKey = config.swapContract.protectedBtcKey
  let btcSmsPublicKeys = [btcSMSServerKey, mnemonicKey]

  await actions.btcmultisig.login_SMS(privateKey, btcSmsPublicKeys)
  await getBalance()
}

const getAddrBalance = (address) => {
  return apiLooper.get('bitpay', `/addr/${address}`, {
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
    return {
      address,
      balance,
      unconfirmedBalance,
    }
  })
}

const getBalance = (ownAddress, ownDataKey) => {
  const { user: { btcMultisigSMSData: { address } } } = getState()
  const checkAddress = (ownAddress) ? ownAddress : address
  const dataKey = (ownDataKey) ? ownDataKey : 'btcMultisigSMSData'

  if (checkAddress === 'Not jointed') {
    return new Promise((resolve) => {
      reducers.user.setBalance({
        name: dataKey,
        amount: 0,
        unconfirmedBalance: 0,
      })
      resolve(0)
    })
  }

  return getAddrBalance(checkAddress).then(({ balance, unconfirmedBalance }) => {
    reducers.user.setBalance({ name: dataKey, amount: balance, unconfirmedBalance })
    return balance
  })
    .catch((e) => {
      reducers.user.setBalanceError({ name: dataKey })
    })
}

const getBalanceUser = (checkAddress) => {
  const { user: { btcMultisigUserData: { address } } } = getState()
  if (!checkAddress) {
    return getBalance(address, 'btcMultisigUserData')
  } else {
    return getAddrBalance(checkAddress).then(({ balance, unconfirmedBalance }) => {
      reducers.user.setBtcMultisigBalance({
        address: checkAddress,
        amount: balance,
        isBalanceFetched: true,
        unconfirmedBalance,
      })

      return balance
    })
  }
}

const getRate = async () => {
  const activeFiat = window.DEFAULT_FIAT || 'USD'

  const exCurrencyRate = await actions.user.getExchangeRate('BTC', activeFiat.toLowerCase())
  reducers.user.setCurrencyRate({ name: 'btcData', currencyRate: exCurrencyRate })
}

const getBalanceG2FA = () => {
}

const fetchBalance = (address) =>
  apiLooper.get('bitpay', `/addr/${address}`, {
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
  }).then(({ balance }) => balance)

const fetchTx = (hash) =>
  apiLooper.get('bitpay', `/tx/${hash}`, {
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

const fetchTxInfo = (hash) =>
  fetchTx(hash)
    .then(({ vin, ...rest }) => ({
      senderAddress: vin ? vin[0].addr : null,
      ...rest,
    }))

const getTransactionUser = (address) => {
  if (!address) {
    // Fetch all 
    return new Promise(async (resolve) => {
      const msWallets = await getBtcMultisigKeys({
        opts: {
          dontFetchBalance: true,
        }
      })

      if (msWallets.length) {
        const promiseList = msWallets.map((walletData) => {
          return getTransactionUser(walletData.address)
        })

        const txLists = await Promise.all(promiseList)

        let retValue = []
        txLists.forEach((txs) => {
          retValue = [...retValue, ...txs]
        })

        resolve(retValue)
      } else {
        resolve([])
      }
    })
  } else {
    return getTransaction(address, 'btc (multisig)')
  }
}

const getTransactionSMS = (address) => { return getTransaction(address) }

const getTransactionG2FA = () => { }

const getInvoicesSMS = () => {
  const { user: { btcMultisigSMSData: { address } } } = getState()

  return actions.invoices.getInvoices({
    currency: 'BTC',
    address,
  })
}

const getInvoicesUser = () => {
  const { user: { btcMultisigUserData: { address } } } = getState()

  return actions.invoices.getInvoices({
    currency: 'BTC',
    address,
  })
}

const getTransaction = (ownAddress, ownType) =>
  new Promise((resolve) => {
    const { user: { btcMultisigSMSData: { address } } } = getState()
    const checkAddress = (ownAddress) ? ownAddress : address
    const type = (ownType) ? ownType : 'btc (sms-protected)'
    const url = `/txs/?address=${checkAddress}`

    if (checkAddress === 'Not jointed') {
      resolve([])
      return
    }

    return apiLooper.get('bitpay', url, {
      checkStatus: (answer) => {
        try {
          if (answer && answer.txs !== undefined) return true
        } catch (e) { /* */ }
        return false
      },
    }).then((res) => {
      const transactions = res.txs.map((item) => {
        const direction = item.vin[0].addr !== checkAddress ? 'in' : 'out'
        const isSelf = direction === 'out'
          && item.vout.filter((item) =>
            item.scriptPubKey.addresses[0] === checkAddress
          ).length === item.vout.length

        return ({
          type,
          hash: item.txid,
          confirmations: item.confirmations,
          value: isSelf
            ? item.fees
            : item.vout.filter((item) => {
              const currentAddress = item.scriptPubKey.addresses[0]

              return direction === 'in'
                ? (currentAddress === checkAddress)
                : (currentAddress !== checkAddress)
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
  const {
    user: {
      btcMultisigSMSData: {
        privateKey,
        publicKeys,
        publicKey,
      },
      btcData: {
        address,
      },
    },
  } = getState()

  let feeFromAmount = BigNumber(0)

  if (hasAdminFee) {
    const {
      fee: adminFee,
      min: adminFeeMinValue,
    } = hasAdminFee

    const adminFeeMin = BigNumber(adminFeeMinValue)

    feeFromAmount = BigNumber(adminFee).dividedBy(100).multipliedBy(amount)
    if (adminFeeMin.isGreaterThan(feeFromAmount)) feeFromAmount = adminFeeMin


    feeFromAmount = feeFromAmount.multipliedBy(1e8).integerValue() // Admin fee in satoshi
  }

  feeValue = feeValue || await btc.estimateFeeValue({ inSatoshis: true, speed, method: 'send_2fa' })


  const unspents = await fetchUnspents(from)

  const fundValue = new BigNumber(String(amount)).multipliedBy(1e8).integerValue().toNumber()
  const totalUnspent = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
  const skipValue = totalUnspent - fundValue - feeValue - feeFromAmount

  const p2ms = bitcoin.payments.p2ms({
    m: 2,
    n: publicKeys.length,
    pubkeys: publicKeys,
    network: btc.network,
  })
  const p2sh = bitcoin.payments.p2sh({ redeem: p2ms, network: btc.network })

  // console.log('P2SH Address:',p2sh.address)
  // console.log('P2SH Script')
  // console.log(bitcoin.script.toASM(p2sh.redeem.output))
  // console.log(publicKey.toString('Hex'))
  // console.log(bitcoin.ECPair.fromWIF(privateKey, btc.network).publicKey.toString('Hex'))


  let txb1 = new bitcoin.TransactionBuilder(btc.network)

  unspents.forEach(({ txid, vout }) => txb1.addInput(txid, vout, 0xfffffffe))
  txb1.addOutput(to, fundValue)

  if (skipValue > 546) {
    txb1.addOutput(from, skipValue)
  }

  if (hasAdminFee) {
    // admin fee output
    txb1.addOutput(hasAdminFee.address, feeFromAmount.toNumber())
  }

  txb1.__INPUTS.forEach((input, index) => {
    txb1.sign(index, bitcoin.ECPair.fromWIF(privateKey, btc.network), p2sh.redeem.output)
  })

  let txRaw = txb1.buildIncomplete()
  // console.log('Multisig transaction ready')
  // console.log('Your key:', publicKey.toString('Hex'))
  // console.log('TX Hash:', txRaw.toHex())
  // console.log('Send it to other owner for sign and broadcast')

  let authKeys = publicKeys.slice(1)
  authKeys = JSON.stringify(authKeys.map((key) => key.toString('Hex')))

  try {
    const result = await apiLooper.post('btc2FAProtected', `/push/`, {
      body: {
        address,
        publicKey: authKeys,
        checkSign: _getSign,
        rawTX: txRaw.toHex(),
        mainnet: process.env.MAINNET ? true : false,
      },
      timeout: {
        response: 0,
        deadline: 5000,
      },
    })
    return {
      ...result,
      rawTx: txRaw.toHex(),
    }
  } catch (apiError) {
    return {
      error: apiError.message,
      rawTx: txRaw.toHex(),
    }
    console.error(apiError)
    return false
  }
}


const confirmSMSProtected = async (smsCode) => {
  const {
    user: {
      btcMultisigSMSData: {
        privateKey,
        publicKeys,
        publicKey,
      },
      btcData: {
        address,
      },
    },
  } = getState()

  let authKeys = publicKeys.slice(1)
  authKeys = JSON.stringify(authKeys.map((key) => key.toString('Hex')))

  const result = await apiLooper.post('btc2FAProtected', `/sign/`, {
    body: {
      address,
      publicKey: authKeys,
      checkSign: _getSign,
      code: smsCode,
      mainnet: process.env.MAINNET ? true : false,
    },
  })
  return result
}

const send = async ({ from, to, amount, feeValue, speed } = {}) => {
  feeValue = feeValue || await btc.estimateFeeValue({ inSatoshis: true, speed, method: 'send_multisig' })
  const { user: { btcMultisigUserData: { address, privateKey, publicKeys, publicKey } } } = getState()

  let feeFromAmount = BigNumber(0)

  if (hasAdminFee) {
    const {
      fee: adminFee,
      min: adminFeeMinValue,
    } = hasAdminFee

    const adminFeeMin = BigNumber(adminFeeMinValue)

    feeFromAmount = BigNumber(adminFee).dividedBy(100).multipliedBy(amount)
    if (adminFeeMin.isGreaterThan(feeFromAmount)) feeFromAmount = adminFeeMin


    feeFromAmount = feeFromAmount.multipliedBy(1e8).integerValue()
  }

  const unspents = await fetchUnspents(from)

  const fundValue = new BigNumber(String(amount)).multipliedBy(1e8).integerValue().toNumber()
  const totalUnspent = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
  const skipValue = totalUnspent - fundValue - feeValue - feeFromAmount

  const p2ms = bitcoin.payments.p2ms({
    m: 2,
    n: publicKeys.length,
    pubkeys: publicKeys,
    network: btc.network,
  })

  const p2sh = bitcoin.payments.p2sh({ redeem: p2ms, network: btc.network })

  let txb1 = new bitcoin.TransactionBuilder(btc.network)

  unspents.forEach(({ txid, vout }) => txb1.addInput(txid, vout, 0xfffffffe))
  txb1.addOutput(to, fundValue)

  if (skipValue > 546) {
    txb1.addOutput(from, skipValue)
  }

  if (hasAdminFee) {
    // admin fee output
    txb1.addOutput(hasAdminFee.address, feeFromAmount.toNumber())
  }

  txb1.__INPUTS.forEach((input, index) => {
    txb1.sign(index, bitcoin.ECPair.fromWIF(privateKey, btc.network), p2sh.redeem.output)
  })

  let txRaw = txb1.buildIncomplete()

  return txRaw.toHex()
}

const getMSWalletByPubkeysHash = async (pubkeysHash, myBtcWallets) => {
  if (!myBtcWallets) myBtcWallets = await getBtcMultisigKeys()
  if (typeof pubkeysHash !== 'string') pubkeysHash = pubkeysHash.map(buf => buf.toString('hex')).join('-')

  const wallets = myBtcWallets.filter((wallet) => {
    const hash = wallet.publicKeys.map(buf => buf.toString('hex')).join('-')
    if (pubkeysHash === hash) {

      return true
    }
  }).map((wallet) => {
    const {
      publicKeys,
      publicKey,
      address,
      balance,
    } = wallet

    return {
      publicKeys,
      publicKey,
      address,
      balance,
    }
  })

  return (wallets.length) ? wallets[0] : false
}

const parseRawTX = async (txHash) => {
  const myBtcWallets = await getBtcMultisigKeys()
  const myBtcAddreses = myBtcWallets.map((wallet) => wallet.address)

  const txb = await bitcoin.TransactionBuilder.fromTransaction(
    bitcoin.Transaction.fromHex(txHash),
    btc.network
  )

  const parsedTX = {
    txb,
    input: [],
    output: [],
    from: false,
    to: false,
    out: {},
    isOur: false,
    amount: new BigNumber(0),
  }

  await new Promise((inputParsed) => {
    txb.__INPUTS.forEach(async (input) => {
      const inputWallet = await getMSWalletByPubkeysHash(input.pubkeys, myBtcWallets)

      if (inputWallet) {
        if (inputWallet.address) parsedTX.from = inputWallet.address
        parsedTX.wallet = inputWallet
        parsedTX.isOur = true
      }

      parsedTX.input.push({
        script: bitcoin.script.toASM(input.redeemScript),
        wallet: inputWallet,
        publicKeys: input.pubkeys.map(buf => buf.toString('hex')),
      })
    })
    inputParsed()
  }).then(() => {
    txb.__TX.outs.forEach((out) => {
      let address
      try {
        address = bitcoin.address.fromOutputScript(out.script, btc.network)
      } catch (e) { }

      if (!parsedTX.isOur) {
        const outWallet = myBtcWallets.filter((wallet) => wallet.address === address)

        if (outWallet.length) {
          if (outWallet[0].address) parsedTX.from = outWallet[0].address
          parsedTX.wallet = outWallet[0]
          parsedTX.isOur = true
        }
      }
      if (parsedTX.from !== address) {
        if (!parsedTX.out[address]) {
          parsedTX.out[address] = {
            to: address,
            amount: new BigNumber(out.value).dividedBy(1e8).toNumber(),
          }
        } else {
          parsedTX.out[address].amount = parsedTX.out[address].amount.plus(new BigNumber(out.value).dividedBy(1e8).toNumber())
        }
        parsedTX.amount = parsedTX.amount.plus(new BigNumber(out.value).dividedBy(1e8).toNumber())
      }

      parsedTX.output.push({
        address,
        valueSatoshi: out.value,
        value: new BigNumber(out.value).dividedBy(1e8).toNumber(),
      })
    })

    if (Object.keys(parsedTX.out).length) {
      parsedTX.to = parsedTX.out[Object.keys(parsedTX.out)[0]].to
    }
  })

  console.log('parsedTX', parsedTX)
  return parsedTX
}


const signMofNByMnemonic = async (txHash, option_M, publicKeys, mnemonic, walletNumber, ownPath) => {
  const mnemonicWallet = actions.btc.getWalletByWords(mnemonic, walletNumber, ownPath)
  if (mnemonicWallet) {
    console.log(mnemonicWallet)
    console.log(txHash)
    let txb = bitcoin.TransactionBuilder.fromTransaction(
      bitcoin.Transaction.fromHex(txHash),
      btc.network
    );

    console.log('p2ms', option_M, publicKeys.length, publicKeys)
    const p2ms = bitcoin.payments.p2ms({
      m: option_M,
      n: publicKeys.length,
      pubkeys: publicKeys,
      network: btc.network,
    })

    const p2sh = bitcoin.payments.p2sh({ redeem: p2ms, network: btc.network })

    console.log(txb)
    txb.__INPUTS.forEach((input, index) => {
      txb.sign(index, bitcoin.ECPair.fromWIF(mnemonicWallet.WIF, btc.network), p2sh.redeem.output)
    })

    let tx = await txb.build()
    const txHex = tx.toHex()
    return txHex
  }
}

const signMofN = async (txHash, option_M, publicKeys, privateKey) => {
  let txb = bitcoin.TransactionBuilder.fromTransaction(
    bitcoin.Transaction.fromHex(txHash),
    btc.network
  );

  const p2ms = bitcoin.payments.p2ms({
    m: option_M,
    n: publicKeys.length,
    pubkeys: publicKeys,
    network: btc.network,
  })

  const p2sh = bitcoin.payments.p2sh({ redeem: p2ms, network: btc.network })

  txb.__INPUTS.forEach((input, index) => {
    txb.sign(index, bitcoin.ECPair.fromWIF(privateKey, btc.network), p2sh.redeem.output)
  })

  let tx = await txb.build()
  const txHex = tx.toHex()
  return txHex
}

const signMultiSign = async (txHash, wallet) => {
  let {
    user: {
      btcMultisigUserData: {
        privateKey,
        publicKeys,
      },
    },
  } = getState()

  if (wallet) {
    publicKeys = wallet.publicKeys
    console.log('sign tx - use custrom public keys')
  }
  console.log('sign tx', txHash, privateKey, publicKeys)
  return signMofN(txHash, 2, publicKeys, privateKey)
}

const signSmsMnemonic = (txHash, mnemonic) => {
  const {
    user: {
      btcMultisigSMSData: {
        publicKeys,
      },
    },
  } = getState()

  return signMofNByMnemonic(txHash, 2, publicKeys, mnemonic, 1)
}

const signSmsMnemonicAndBuild = (txHash, mnemonic) => {
  return new Promise(async (resolve, reject) => {
    const rawTx = signSmsMnemonic(txHash, mnemonic)
    if (!rawTx) {
      reject('rawTx empty')
    } else {
      resolve(rawTx)
    }
  })
}

const checkSmsMnemonic = (mnemonic) => {
  const {
    user: {
      btcMultisigSMSData: {
        publicKeys,
      },
    },
  } = getState()

  const mnemonicWallet = actions.btc.getWalletByWords(mnemonic, 1)
  if (mnemonicWallet) {
    const matchedKeys = publicKeys.filter((key) => { return key.toString('Hex') === mnemonicWallet.publicKey })
    return (matchedKeys.length > 0)
  }
  return false
}

const signAndBuild = (transactionBuilder, p2sh) => {
  const {
    user: {
      btcData: {
        privateKey,
      },
    },
  } = getState()

  const keyPair = bitcoin.ECPair.fromWIF(privateKey, btc.network)

  transactionBuilder.__INPUTS.forEach((input, index) => {
    transactionBuilder.sign(index, keyPair, p2sh)
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
  const privateKey = keyPair.d.toBuffer(32)

  const signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed)

  return signature.toString('base64')
}

const getReputation = () => Promise.resolve(0)

export default {
  beginRegisterSMS,
  confirmRegisterSMS,
  checkSMSActivated,
  checkG2FAActivated,
  checkUserActivated,
  login_SMS,
  login_G2FA,
  login_USER,
  getBalance,
  getBalanceUser,
  getBalanceG2FA,
  getTransaction,
  getTransactionSMS,
  getTransactionUser,
  getTransactionG2FA,
  send,
  sendSMSProtected,
  confirmSMSProtected,
  fetchUnspents,
  broadcastTx,
  broadcastTX2Room,
  fetchTx,
  fetchTxInfo,
  fetchBalance,
  signMessage,
  getReputation,
  enableWalletSMS,
  enableWalletG2FA,
  enableWalletUSER,
  parseRawTX,
  signMultiSign,
  signSmsMnemonic,
  signSmsMnemonicAndBuild,
  checkSmsMnemonic,
  onUserMultisigJoin,
  onUserMultisigSend,
  getInvoicesSMS,
  getInvoicesUser,
  isBTCAddress,
  getBtcMultisigKeys,
  addBtcMultisigKey,
  removeBtcMultisigNey,
  switchBtcMultisigKey,
  addSMSWallet,
  isBTCSMSAddress,
  isBTCMSUserAddress,
  signToUserMultisig,
  getSmsKeyFromMnemonic,
  fetchMultisigBalances,
  getAddrBalance,
  addressToWallet,
}
