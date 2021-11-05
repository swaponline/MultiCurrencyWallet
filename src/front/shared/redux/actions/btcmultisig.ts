import BigInteger from 'bigi'

import { BigNumber } from 'bignumber.js'
import * as bitcoin from 'bitcoinjs-lib'
import bitcoinMessage from 'bitcoinjs-message'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import * as mnemonicUtils from 'common/utils/mnemonic'
import { apiLooper, constants, api } from 'helpers'
import btc from 'helpers/btc'
import actions from 'redux/actions'
import config from 'helpers/externalConfig'
import SwapApp from 'swap.app'

import { MnemonicKey } from 'common/types'

import { default as bitcoinUtils } from 'common/utils/coin/btc'

const BITPAY_API = {
  name: 'bitpay',
  servers: config.api.bitpay,
}

const BLOCYPER_API = {
  name: 'blockcypher',
  servers: config.api.blockcypher,
}

const hasAdminFee = (
  config
  && config.opts
  && config.opts.fee
  && config.opts.fee.btc
  && config.opts.fee.btc.fee
  && config.opts.fee.btc.address
  && config.opts.fee.btc.min
) ? config.opts.fee.btc : false

const NETWORK = (process.env.MAINNET) ? `MAINNET` : `TESTNET`

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
  //@ts-ignore: strictNullChecks
  try { savedKeys = JSON.parse(savedKeys) } catch (e) { }
  //@ts-ignore
  if (!(savedKeys instanceof Array)) {
    //@ts-ignore
    savedKeys = [savedKeys]
  }

  return savedKeys
}

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
    },
  })
  //@ts-ignore
  const wallets = walletsData.map((data) => ({
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
    isBTC: true,
  })).filter((wallet) => wallet.address !== btcMultisigUserData.address)

  btcMultisigUserData.wallets = wallets

  reducers.user.setAuthData({ name: 'btcMultisigUserData', data: btcMultisigUserData })

  fetchMultisigBalances()
}

const fetchMultisigBalances = () => {
  const {
    user: {
      btcMultisigUserData: {
        wallets,
      },
    },
  } = getState()

  if (wallets && wallets.length) {
    wallets.map(({ address }, index) => new Promise(async (resolve) => {
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
    }))
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
    //@ts-ignore: strictNullChecks
    if (savedKeys.length > 0) {
      //@ts-ignore: strictNullChecks
      for (let i = 0; i < savedKeys.length; i++) {
        //@ts-ignore: strictNullChecks
        if (savedKeys[i]) {
          //@ts-ignore: strictNullChecks
          const walletData = login_USER(privateKey, savedKeys[i], true)

          walletData.index = i
          //@ts-ignore
          walletData.balance = (opts.dontFetchBalance) ? 0 : await fetchBalance(walletData.address)
          //@ts-ignore: strictNullChecks
          keysInfo.push(walletData)
        }
      }
    }

    resolve(keysInfo)
  })
}

const addBtcMultisigKey = (publicKey, isPrimary) => {
  const savedKeys = _loadBtcMultisigKeys()

  //@ts-ignore: strictNullChecks
  if (!savedKeys.includes(publicKey)) {
    //@ts-ignore
    savedKeys.push(publicKey)
  }

  localStorage.setItem(constants.privateKeyNames.btcMultisigOtherOwnerKey, JSON.stringify(savedKeys))

  if (isPrimary) switchBtcMultisigKey(publicKey)
}

const switchBtcMultisigKey = (keyOrIndex) => {
  const savedKeys = _loadBtcMultisigKeys()

  let index = keyOrIndex
  //@ts-ignore: strictNullChecks
  if (!Number.isInteger(index)) index = savedKeys.indexOf(keyOrIndex)

  //@ts-ignore: strictNullChecks
  if ((index > -1) && (index < savedKeys.length)) {
    if (index !== 0) {
      //@ts-ignore
      const newKey = savedKeys.splice(index, 1)
      //@ts-ignore
      savedKeys.unshift(newKey[0])
      localStorage.setItem(constants.privateKeyNames.btcMultisigOtherOwnerKey, JSON.stringify(savedKeys))

      const {
        user: {
          btcData: {
            privateKey,
          },
        },
      } = getState()
      //@ts-ignore
      login_USER(privateKey, newKey[0])
      //@ts-ignore
      getBalanceUser()
    }
  }
}

const removeBtcMultisigNey = (keyOrIndex) => {
  const savedKeys = _loadBtcMultisigKeys()

  let index = keyOrIndex
  //@ts-ignore: strictNullChecks
  if (!Number.isInteger(index)) index = savedKeys.indexOf(keyOrIndex)

  if (index > -1) {
    //@ts-ignore
    const newKey = savedKeys.splice(index, 1)

    localStorage.setItem(constants.privateKeyNames.btcMultisigOtherOwnerKey, JSON.stringify(savedKeys))

    if (index === 0) {
      switchBtcMultisigKey(0)
      return true
    }
  }
}

const checkPINActivated = () => {
  const { user: { btcMultisigPinData: { isRegistered } } } = getState()
  return isRegistered
}

const checkG2FAActivated = () => false

const checkUserActivated = () => {
  const { user: { btcMultisigUserData: { active } } } = getState()
  return active
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
  //@ts-ignore
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
    isBTC: true,
  }

  localStorage.setItem(constants.privateKeyNames.btcMultisigOtherOwnerKey, otherOwnerPublicKey)

  window.getBtcMultisigData = () => data
  window.getBtcMultisigAddress = () => data.address

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

  window.getBtcSmsData = () => data
  reducers.user.setAuthData({ name: 'btcMultisigSMSData', data })
}

const login_PIN = (privateKey, otherOwnerPublicKey) => {
  const data = login_(privateKey, otherOwnerPublicKey, false)

  if (!data) return false

  const isRegistered = (localStorage.getItem(`${constants.localStorage.didPinBtcCreated}:${data.address}`) === '1')


  data.currency = 'BTC (PIN-Protected)'
  data.fullName = 'Bitcoin (PIN-Protected)'
  data.isRegistered = (otherOwnerPublicKey instanceof Array && otherOwnerPublicKey.length > 1) ? true : isRegistered
  data.isPinProtected = true

  window.getBtcPinData = () => data
  reducers.user.setAuthData({ name: 'btcMultisigPinData', data })
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

  // Setup pubsubRoom sign request
  actions.pubsubRoom.onReady(() => {
    const { user: { btcMultisigUserData: { address } } } = getState()
    const onRequestEventName = `btc multisig request sign ${address}`
    //@ts-ignore: strictNullChecks
    SwapApp.shared().services.room.subscribe(onRequestEventName, (_data) => {
      const { txData } = _data
      if (txData && txData.address && txData.amount && txData.currency && txData.txRaw) {
        //@ts-ignore: strictNullChecks
        SwapApp.shared().services.room.sendMessagePeer(
          _data.fromPeer,
          {
            event: `btc multisig accept tx ${address}`,
            data: {},
          }
        )
        actions.notifications.show('BTCMultisignRequest', txData)
        //@ts-ignore: strictNullChecks
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
    let publicKeysRaw: string[] = []

    if (otherOwnerPublicKey instanceof Array) {
      otherOwnerPublicKey.forEach((key) => {
        if (key) {
          publicKeysRaw.push(key)
        }
      })
    } else {
      publicKeysRaw.push(otherOwnerPublicKey)
    }
    //@ts-ignore: strictNullChecks
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
    //@ts-ignore
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
      isBTC: true,
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
      isBTC: true,
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
    //@ts-ignore: strictNullChecks
    SwapApp.shared().services.room.sendMessagePeer(fromPeer, {
      event: 'btc multisig join ready',
      data: {},
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
    //@ts-ignore
    clearTimeout(failTimer)
    //@ts-ignore: strictNullChecks
    SwapApp.shared().services.room.unsubscribe(onSuccessEventName, onSuccessEvent)
    if (cbSuccess) cbSuccess()
  }

  const cancelFunc = () => {
    console.log('broadcast multisig canceled')
    //@ts-ignore
    clearTimeout(failTimer)
    //@ts-ignore: strictNullChecks
    SwapApp.shared().services.room.unsubscribe(onSuccessEventName, onSuccessEvent)
  }

  const onFailTimer = () => {
    console.log('broadcast multisig fail timer')
    //@ts-ignore
    clearTimeout(failTimer)
    //@ts-ignore: strictNullChecks
    SwapApp.shared().services.room.unsubscribe(onSuccessEventName, onSuccessEvent)
    if (cbFail) cbFail()
  }
  //@ts-ignore
  failTimer = setTimeout(onFailTimer, 30000)

  //@ts-ignore: strictNullChecks
  SwapApp.shared().services.room.subscribe(onSuccessEventName, onSuccessEvent)

  // Broadcast TX
  //@ts-ignore: strictNullChecks
  SwapApp.shared().services.room.sendMessageRoom({
    event: `btc multisig request sign ${address}`,
    data: {
      txData,
      publicKey: publicKey.toString('hex'),
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

const registerPinWallet = async (password, mnemonic, ownPublicKey) => {
  const {
    user: {
      btcData: {
        address,
        publicKey: mainKey,
      },
    },
  } = getState()

  const btcPinServerKey = config.swapContract.btcPinKey
  const publicKeys = [btcPinServerKey]
  let mnemonicKey = false

  if (mnemonic && !ownPublicKey) {
    // 2of3 - extract public key from mnemonic
    const mnemonicAccount = actions.btc.getWalletByWords(mnemonic, 1)
    //@ts-ignore
    mnemonicKey = mnemonicAccount.publicKey
    publicKeys.push(mnemonicKey)
  }

  // Возможность использовать произвольный публик-кей для разблокирования
  if (ownPublicKey) {
    publicKeys.push(ownPublicKey)
    mnemonicKey = ownPublicKey
  }

  publicKeys.push(mainKey.toString('Hex'))

  const sign = _getSign()

  const newKeys = JSON.stringify(publicKeys)

  try {
    const result: any = await apiLooper.post('btcPin', `/register/`, {
      body: {
        address,
        password,
        publicKey: newKeys,
        checkSign: sign,
        mainnet: !!process.env.MAINNET,
        source: window.location.hostname,
      },
    })

    if ((result && result.answer && result.answer === 'ok') || (result.error === 'Already registered')) {
      localStorage.setItem(`${constants.localStorage.didPinBtcCreated}:${address}`, '1')
      addPinWallet(mnemonicKey)
    }

    return result
  } catch (error) {
    console.error(error)
    return false
  }
}

const isPinRegistered = async (mnemonic) => {
  const {
    user: {
      btcData: {
        address,
        publicKey,
      },
    },
  } = getState()

  const mnemonicAccount = actions.btc.getWalletByWords(mnemonic, 1)
  const mnemonicKey = mnemonicAccount.publicKey
  const privateKey = mnemonicAccount.WIF
  const serverKey = config.swapContract.btcPinKey
  //@ts-ignore
  const publicKeys = [serverKey, mnemonicKey.toString('Hex'), publicKey.toString('Hex')]

  try {
    const result: any = await apiLooper.post('btcPin', `/login/`, {
      body: {
        address,
        publicKey: JSON.stringify(publicKeys),
        mainnet: config.entry === 'mainnet',
      },
    })

    if (result?.answer === 'Exist') {
      return {
        exist: true,
        publicKeys,
        privateKey,
      }
    } else {
      return false
    }
  } catch (error) {
    console.group('%c isPinRegistered', 'color: red;')
    console.error(error)
    console.groupEnd()
    return false
  }
}

const addPinWallet = async (mnemonicOrKey) => {
  const {
    user: {
      btcData: {
        privateKey,
      },
    },
  } = getState()

  let mnemonicKey = mnemonicOrKey

  if (mnemonicOrKey && mnemonicUtils.validateMnemonicWords(mnemonicOrKey)) {
    const mnemonicAccount = actions.btc.getWalletByWords(mnemonicOrKey, 1)
    mnemonicKey = mnemonicAccount.publicKey
  }

  //@ts-ignore: strictNullChecks
  let btcPinMnemonicKey: MnemonicKey = localStorage.getItem(constants.privateKeyNames.btcPinMnemonicKey)

  try { 
    //@ts-ignore: strictNullChecks
    btcPinMnemonicKey = JSON.parse(btcPinMnemonicKey) 
  } catch (e) {
    console.error(e)
  }

  if (!(btcPinMnemonicKey instanceof Array)) {
    btcPinMnemonicKey = []
  }

  const index = btcPinMnemonicKey.indexOf(mnemonicKey)

  if (index === -1) btcPinMnemonicKey.unshift(mnemonicKey)
  if ((index > -1) && (index < btcPinMnemonicKey.length)) {
    if (index !== 0) {
      btcPinMnemonicKey = btcPinMnemonicKey.splice(index, 1)
      btcPinMnemonicKey.unshift(mnemonicKey)
    }
  }

  localStorage.setItem(constants.privateKeyNames.btcPinMnemonicKey, JSON.stringify(btcPinMnemonicKey))

  const btcPinServerKey = config.swapContract.btcPinKey
  let btcPinPublicKeys = [btcPinServerKey, mnemonicKey]

  await actions.btcmultisig.login_PIN(privateKey, btcPinPublicKeys)
  const { user: { btcMultisigPinData: { address } } } = getState()

  //@ts-ignore: strictNullChecks
  await getBalance(address, 'btcMultisigPinData')
}

const getAddrBalance = (address) => {
  return new Promise((resolve) => {
    bitcoinUtils.fetchBalance({
      address,
      withUnconfirmed: true,
      apiBitpay: BITPAY_API
    }).then((answer) => {
      //@ts-ignore
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

const getBalance = (ownAddress = null, ownDataKey = null) => {
  const { user: { btcMultisigSMSData: { address } } } = getState()
  const checkAddress = (ownAddress) || address
  const dataKey = (ownDataKey) || 'btcMultisigSMSData'

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

const getBalancePin = () => {
  const { user: { btcMultisigPinData: { address } } } = getState()

  //@ts-ignore: strictNullChecks
  return getBalance(address, 'btcMultisigPinData')
}

const getBalanceUser = (checkAddress) => {
  const { user: { btcMultisigUserData: { address } } } = getState()
  if (!checkAddress) {
    //@ts-ignore: strictNullChecks
    return getBalance(address, 'btcMultisigUserData')
  }
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

const getBalanceG2FA = () => {
}

const fetchBalance = (address) => bitcoinUtils.fetchBalance({
  address,
  withUnconfirmed: false,
  apiBitpay: BITPAY_API,
})

const fetchTx = (hash, cacheResponse) => bitcoinUtils.fetchTx({
  hash,
  apiBitpay: BITPAY_API,
  cacheResponse,
})

const fetchTxInfo = (hash, cacheResponse, serviceFee = null) => bitcoinUtils.fetchTxInfo({
  hash,
  apiBitpay: BITPAY_API,
  cacheResponse,
  hasAdminFee: serviceFee || hasAdminFee,
})

const getTransactionUser = (address: string = ``) => {
  if (!address) {
    // Fetch all
    return new Promise(async (resolve) => {
      const msWallets = await getBtcMultisigKeys({
        opts: {
          dontFetchBalance: true,
        },
      })
      //@ts-ignore
      if (msWallets.length) {
        //@ts-ignore
        const promiseList = msWallets.map((walletData) => getTransactionUser(walletData.address))

        const txLists = await Promise.all(promiseList)

        let retValue = []
        txLists.forEach((txs) => {
          //@ts-ignore
          retValue = [...retValue, ...txs]
        })

        resolve(retValue)
      } else {
        resolve([])
      }
    })
  }
  return getTransaction(address, 'btc (multisig)')

}
//@ts-ignore
const getTransactionSMS = (address: string = ``) => {
  const {
    user: {
      btcMultisigSMSData: {
        address: smsAddress,
        isRegistered,
      },
    },
  } = getState()
  if (!isRegistered) {
    return new Promise((resolve) => { resolve([]) })
  }
  return getTransaction((address || smsAddress), `btc (sms-protected)`)
}

const getTransactionPIN = (address: string = ``) => {
  const {
    user: {
      btcMultisigPinData: {
        address: pinAddress,
        isRegistered,
      },
    },
  } = getState()
  if (!isRegistered) {
    return new Promise((resolve) => { resolve([]) })
  }
  return getTransaction((address || pinAddress), `btc (pin-protected)`)
}

const getTransactionG2FA = () => { }

const getInvoicesUser = () => {
  const { user: { btcMultisigUserData: { address } } } = getState()

  return actions.invoices.getInvoices({
    currency: 'BTC',
    address,
  })
}

const getTransaction = (ownAddress, ownType) => {
  return bitcoinUtils.getTransactionBlocyper({
    ownAddress,
    ownType,
    myWallets: [ownAddress],
    network: btc.network,
    apiBlocyper: BLOCYPER_API,
  })
}
//@ts-ignore
const sendSMSProtected = async ({ from, to, amount, feeValue, speed, serviceFee = hasAdminFee } = {}) => {
  const {
    user: {
      btcMultisigSMSData: {
        privateKey,
        publicKeys,
      },
      btcData: {
        address,
      },
    },
  } = getState()

  const method = 'send_2fa'

  let preparedFees
  try {
    preparedFees = await bitcoinUtils.prepareFees({
      amount,
      serviceFee,
      feeValue,
      speed,
      method,
      from,
      to,
      NETWORK
    })
  } catch (prepareFeesError) {
    return {
      error: prepareFeesError.message,
    }
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
      method,
      unspents,
      privateKey,
      publicKeys,
      network: btc.network,
      NETWORK
    })
  } catch (prepareRawTxError) {
    return {
      error: prepareRawTxError.message,
    }
  }

  let authKeys = publicKeys.slice(1)
  authKeys = JSON.stringify(authKeys.map((key) => key.toString('Hex')))

  try {
    const result: any = await apiLooper.post('btc2FAProtected', `/push/`, {
      body: {
        address,
        publicKey: authKeys,
        checkSign: _getSign,
        rawTX: rawTx,
        mainnet: process.env.MAINNET ? true : false,
        source: window.location.hostname,
      },
      timeout: {
        response: 0,
        deadline: 5000,
      },
    })
    return {
      ...result,
      rawTx,
    }
  } catch (apiError) {
    return {
      error: apiError.message,
      rawTx,
    }
  }
}

const sendPinProtected = async (params) => {
  const { from, to, amount, feeValue, speed, password, mnemonic, serviceFee = hasAdminFee } = params
  const {
    user: {
      btcMultisigPinData: {
        privateKey,
        publicKeys,
      },
      btcData: {
        address,
      },
    },
  } = getState()

  const method = 'send_2fa'

  let preparedFees
  try {
    preparedFees = await bitcoinUtils.prepareFees({
      amount,
      serviceFee,
      feeValue,
      speed,
      method,
      from,
      to,
      NETWORK
    })
  } catch (prepareFeesError) {
    return {
      error: prepareFeesError.message,
    }
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
      method,
      unspents,
      privateKey,
      publicKeys,
      network: btc.network,
      NETWORK
    })
  } catch (prepareRawTxError) {
    return {
      error: prepareRawTxError.message,
    }
  }

  if (mnemonic) {
    const mnemonicTx = await signPinMnemonic(rawTx, mnemonic)
    const broadcastResult = await actions.btc.broadcastTx(mnemonicTx)
    if (broadcastResult
      && broadcastResult.txid
    ) {
      return {
        answer: 'ok',
        txId: broadcastResult.txid,
      }
    } else {
      return {
        error: `Fail sign transaction by mnemonic`,
      }
    }
  }

  let authKeys = publicKeys
  authKeys = JSON.stringify(authKeys.map((key) => Buffer.from(key).toString('hex')))

  try {
    const result: any = await apiLooper.post('btcPin', `/sign/`, {
      body: {
        address,
        publicKey: authKeys,
        checkSign: _getSign,
        rawTX: rawTx,
        mainnet: process.env.MAINNET ? true : false,
        source: window.location.hostname,
        password,
        version: `v5`,
      },
      timeout: {
        response: 0,
        deadline: 5000,
      },
    })

    if (result
      && result.answer
      && result.answer === 'ok'
      && result.rawTX
    ) {
      const broadcastResult = await actions.btc.broadcastTx(result.rawTX)
      if (broadcastResult
        && broadcastResult.txid
      ) {
        return {
          answer: 'ok',
          txId: broadcastResult.txid,
        }
      } else {
        return {
          error: 'Fail broadcast transaction'
        }
      }
    } else {
      return {
        ...result,
      }
    }
  } catch (apiError) {
    return {
      error: apiError.message,
      rawTx,
    }
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

  const result: any = await apiLooper.post('btc2FAProtected', `/sign/`, {
    body: {
      address,
      version: 'v5',
      publicKey: authKeys,
      checkSign: _getSign,
      code: smsCode,
      mainnet: !!process.env.MAINNET,
      source: window.location.hostname,
    },
  })
  return result
}
//@ts-ignore
const send = async ({ from, to, amount, feeValue, speed, serviceFee = hasAdminFee } = {}) => {
  const {
    user: {
      btcMultisigUserData: {
        privateKey,
      },
    },
  } = getState()

  const senderWallet = addressToWallet(from)

  const { address, publicKeys } = senderWallet

  const method = 'send_multisig'

  let preparedFees
  try {
    preparedFees = await bitcoinUtils.prepareFees({
      amount,
      serviceFee,
      feeValue,
      speed,
      method,
      from: address,
      to,
      NETWORK
    })
  } catch (prepareFeesError) {
    return {
      error: prepareFeesError.message,
    }
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
      from: address,
      to,
      fundValue,
      skipValue,
      serviceFee,
      feeFromAmount,
      method,
      unspents,
      privateKey,
      publicKeys,
      network: btc.network,
      NETWORK
    })
  } catch (prepareRawTxError) {
    return {
      error: prepareRawTxError.message,
    }
  }

  return rawTx
}

const getMSWalletByScript = async (script, myBtcWallets) => {
  //@ts-ignore
  if (!myBtcWallets) myBtcWallets = await getBtcMultisigKeys()
  if (typeof script !== 'string') script = bitcoin.script.toASM( script )

  const wallets = myBtcWallets.filter((wallet) => {
    const keys = wallet.publicKeys.map(buf => buf.toString('hex')).join(` `)
    const walletScript = `OP_2 ${keys} OP_2 OP_CHECKMULTISIG`

    if (walletScript === script) {
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
  //@ts-ignore
  const myBtcWallets = await getBtcMultisigKeys()
  //@ts-ignore
  const myBtcAddreses = myBtcWallets.map((wallet) => wallet.address)

  const psbt = bitcoin.Psbt.fromHex(txHash)

  const parsedTX = {
    psbt,
    input: [],
    output: [],
    from: false,
    to: false,
    out: {},
    isOur: false,
    amount: new BigNumber(0),
  }

  await new Promise((inputParsed) => {
    psbt.data.inputs.forEach( async (input) => {
      const { redeemScript } = input

      const inputWallet = await getMSWalletByScript( redeemScript, myBtcWallets )
      if (inputWallet) {
        if (inputWallet.address) parsedTX.from = inputWallet.address
        //@ts-ignore
        parsedTX.wallet = inputWallet
        parsedTX.isOur = true
      }
    })
    inputParsed(true)
  }).then(() => {
    //@ts-ignore
    psbt.data.globalMap.unsignedTx.tx.outs.forEach(async (out) => {
      const address = bitcoin.address.fromOutputScript(out.script, btc.network)
      if (!parsedTX.isOur) {
        //@ts-ignore
        const outWallet = myBtcWallets.filter((wallet) => wallet.address === address)

        if (outWallet.length) {
          if (outWallet[0].address) parsedTX.from = outWallet[0].address
          //@ts-ignore
          parsedTX.wallet = outWallet[0]
          parsedTX.isOur = true
        }
      }
      //@ts-ignore
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
        //@ts-ignore: strictNullChecks
        address,
        //@ts-ignore: strictNullChecks
        valueSatoshi: out.value,
        //@ts-ignore: strictNullChecks
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
    )

    console.log('p2ms', option_M, publicKeys.length, publicKeys)
    const p2ms = bitcoin.payments.p2ms({
      m: option_M,
      n: publicKeys.length,
      pubkeys: publicKeys,
      network: btc.network,
    })

    const p2sh = bitcoin.payments.p2sh({ redeem: p2ms, network: btc.network })

    console.log(txb)
    //@ts-ignore
    txb.__INPUTS.forEach((input, index) => {
      //@ts-ignore: strictNullChecks
      txb.sign(index, bitcoin.ECPair.fromWIF(mnemonicWallet.WIF, btc.network), p2sh.redeem.output)
    })

    let tx = await txb.build()
    const txHex = tx.toHex()
    return txHex
  }
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

  const psbt = bitcoin.Psbt.fromHex(txHash)

  psbt.signAllInputs(bitcoin.ECPair.fromWIF(privateKey, btc.network))

  psbt.finalizeAllInputs();

  const rawTx = psbt.extractTransaction().toHex()

  return rawTx
}

const signPinMnemonic = (txHash, mnemonic) => {
  return new Promise(async (resolve, reject) => {
    const mnemonicWallet = actions.btc.getWalletByWords(mnemonic, 1)
    const psbt = bitcoin.Psbt.fromHex(txHash)

    psbt.signAllInputs(bitcoin.ECPair.fromWIF(mnemonicWallet.WIF, btc.network))

    psbt.finalizeAllInputs();

    const rawTx = psbt.extractTransaction().toHex()

    if (!rawTx) {
      reject('rawTx empty')
    } else {
      resolve(rawTx)
    }
  })
}

const signSmsMnemonicAndBuild = (txHash, mnemonic) => {
  return new Promise(async (resolve, reject) => {
    const mnemonicWallet = actions.btc.getWalletByWords(mnemonic, 1)
    const psbt = bitcoin.Psbt.fromHex(txHash)

    psbt.signAllInputs(bitcoin.ECPair.fromWIF(mnemonicWallet.WIF, btc.network))

    psbt.finalizeAllInputs();

    const rawTx = psbt.extractTransaction().toHex()

    if (!rawTx) {
      reject('rawTx empty')
    } else {
      resolve(rawTx)
    }
  })
}

const checkPinCanRestory = (mnemonic) => {
  const mnemonicWallet = actions.btc.getWalletByWords(mnemonic, 1)
  //@ts-ignore: strictNullChecks
  let btcSmsMnemonicKey: MnemonicKey = localStorage.getItem(constants.privateKeyNames.btcSmsMnemonicKey)
  
  try {
    //@ts-ignore: strictNullChecks
    btcSmsMnemonicKey = JSON.parse(btcSmsMnemonicKey)
  } catch (e) {
    console.error(e)
  }

  if (btcSmsMnemonicKey instanceof Array && btcSmsMnemonicKey.length > 0) {
    return btcSmsMnemonicKey.includes(mnemonicWallet.publicKey)
  }
  return false
}

const checkPinMnemonic = (mnemonic) => {
  const {
    user: {
      btcMultisigPinData: {
        publicKeys,
      },
    },
  } = getState()
  const mnemonicWallet = actions.btc.getWalletByWords(mnemonic, 1)

  if (mnemonicWallet) {
    const matchedKeys = publicKeys.filter((key) => key.toString('Hex') === mnemonicWallet.publicKey)
    return (matchedKeys.length > 0)
  }
  return false
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
    const matchedKeys = publicKeys.filter((key) => key.toString('Hex') === mnemonicWallet.publicKey)
    return (matchedKeys.length > 0)
  }
  return false
}

const fetchUnspents = (address) => {
  const result: any = actions.btc.fetchUnspents(address)
  return result
}

const broadcastTx = (txRaw) => {
  const result: any = actions.btc.broadcastTx(txRaw)
  return result
}

const signMessage = (message, encodedPrivateKey) => {
  const keyPair = bitcoin.ECPair.fromWIF(encodedPrivateKey, [bitcoin.networks.bitcoin, bitcoin.networks.testnet])
  //@ts-ignore
  const privateKey = keyPair.d.toBuffer(32)

  const signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed)

  return signature.toString('base64')
}

export default {
  // SMS Protected - outdated. Remove these actions
  getBalance,
  login_SMS,
  checkG2FAActivated,
  checkUserActivated,
  getTransactionSMS,
  sendSMSProtected,
  confirmSMSProtected,
  enableWalletSMS,
  signSmsMnemonicAndBuild,
  checkSmsMnemonic,
  getSmsKeyFromMnemonic,

  // Pin protected
  isPinRegistered,
  login_PIN,
  registerPinWallet,
  checkPINActivated,
  addPinWallet,
  getBalancePin,
  sendPinProtected,
  checkPinMnemonic,
  signPinMnemonic,
  checkPinCanRestory,
  getTransactionPIN,

  // User multisig
  login_USER,
  getBalanceUser,
  getTransaction,
  getTransactionUser,

  send,

  fetchUnspents,
  broadcastTx,
  broadcastTX2Room,
  fetchTx,
  fetchTxInfo,
  fetchBalance,
  signMessage,
  enableWalletUSER,

  parseRawTX,
  signMultiSign,

  onUserMultisigJoin,
  onUserMultisigSend,
  getInvoicesUser,

  getBtcMultisigKeys,
  addBtcMultisigKey,
  removeBtcMultisigNey,
  switchBtcMultisigKey,

  fetchMultisigBalances,

  isBTCMSUserAddress,
  signToUserMultisig,

  // common
  getAddrBalance,
  addressToWallet,

  // Google 2fa (draft not implements)
  login_G2FA,
  getBalanceG2FA,
  getTransactionG2FA,
  enableWalletG2FA,
}
