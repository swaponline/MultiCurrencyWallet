import erc20Like from 'common/erc20Like';
import config from 'app-config'
import moment from 'moment/moment'
import { constants, ethToken } from 'helpers'
import request from 'common/utils/request'
import * as mnemonicUtils from 'common/utils/mnemonic'
import TOKEN_STANDARDS from 'common/helpers/constants/TOKEN_STANDARDS'
import actions from 'redux/actions'
import { getState } from 'redux/core'

import reducers from 'redux/core/reducers'

import { getActivatedCurrencies } from 'helpers/user'
import getCurrencyKey from 'helpers/getCurrencyKey'
import metamask from 'helpers/metamask'

import { MnemonicKey } from './types'


/*
  Когда добавляем reducers, для старых пользователей они не инициализированы
  Нужно проверять значение, и если undefined - инициализировать
*/
const initReducerState = () => {
  const {
    user: {
      activeCurrency,
      activeFiat,
    },
  } = getState()

  if (!activeCurrency) reducers.user.setActiveCurrency({ activeCurrency: 'BTC' })
  if (!activeFiat) reducers.user.setActiveFiat({ activeFiat: window.DEFAULT_FIAT || 'USD' })
}

const sign_btc_multisig = async (btcPrivateKey) => {
  let btcMultisigOwnerKey = localStorage.getItem(constants.privateKeyNames.btcMultisigOtherOwnerKey)
  //@ts-ignore: strictNullChecks
  try { btcMultisigOwnerKey = JSON.parse(btcMultisigOwnerKey) } catch (e) { }
  //@ts-ignore
  const _btcMultisigPrivateKey = actions.btcmultisig.login_USER(btcPrivateKey, btcMultisigOwnerKey)
  await actions.btcmultisig.signToUserMultisig()
}


const sign_btc_2fa = async (btcPrivateKey) => {
  const btcSMSServerKey = config.swapContract.protectedBtcKey
  let btcSmsPublicKeys = [btcSMSServerKey]
  //@ts-ignore: strictNullChecks
  let btcSmsMnemonicKey: MnemonicKey = localStorage.getItem(constants.privateKeyNames.btcSmsMnemonicKey)
  
  try { 
    //@ts-ignore: strictNullChecks
    btcSmsMnemonicKey = JSON.parse(btcSmsMnemonicKey) 
  } catch (e) {
    console.error(e)
  }

  if (btcSmsMnemonicKey instanceof Array && btcSmsMnemonicKey.length > 0) {
    btcSmsPublicKeys.push(btcSmsMnemonicKey[0])
  }
  const _btcMultisigSMSPrivateKey = actions.btcmultisig.login_SMS(btcPrivateKey, btcSmsPublicKeys)
}

const sign_btc_pin = async (btcPrivateKey) => {
  const btcPinServerKey = config.swapContract.btcPinKey
  let btcPinPublicKeys = [btcPinServerKey]
  //@ts-ignore: strictNullChecks
  let btcPinMnemonicKey: MnemonicKey = localStorage.getItem(constants.privateKeyNames.btcPinMnemonicKey)
  
  try { 
    //@ts-ignore: strictNullChecks
    btcPinMnemonicKey = JSON.parse(btcPinMnemonicKey) 
  } catch (e) {
    console.error(e)
  }

  if (btcPinMnemonicKey instanceof Array && btcPinMnemonicKey.length > 0) {
    btcPinPublicKeys.push(btcPinMnemonicKey[0])
  }

  console.log('sign to btc pin', btcPinPublicKeys)
  const _btcMultisigPinPrivateKey = actions.btcmultisig.login_PIN(btcPrivateKey, btcPinPublicKeys)
}

const sign = async () => {
  metamask.web3connect.onInit( async () => {
    initReducerState()

    let mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)

    if (!mnemonic) {
      mnemonic = mnemonicUtils.getRandomMnemonicWords()
      localStorage.setItem(constants.privateKeyNames.twentywords, mnemonic)
    }

    const mnemonicKeys = {
      btc: localStorage.getItem(constants.privateKeyNames.btcMnemonic),
      btcSms: localStorage.getItem(constants.privateKeyNames.btcSmsMnemonicKeyGenerated),
      eth: localStorage.getItem(constants.privateKeyNames.ethMnemonic),
      bnb: localStorage.getItem(constants.privateKeyNames.bnbMnemonic),
      ghost: localStorage.getItem(constants.privateKeyNames.ghostMnemonic),
      next: localStorage.getItem(constants.privateKeyNames.nextMnemonic),
    }
    console.log('actions user - sign', mnemonicKeys, mnemonic)

    if (mnemonic !== `-`) {
      //@ts-ignore
      if (!mnemonicKeys.btc) mnemonicKeys.btc = actions.btc.sweepToMnemonic(mnemonic)
      if (!mnemonicKeys.eth) mnemonicKeys.eth = actions.eth.sweepToMnemonic(mnemonic)
      if (!mnemonicKeys.bnb) mnemonicKeys.bnb = actions.bnb.sweepToMnemonic(mnemonic)
      //@ts-ignore
      if (!mnemonicKeys.ghost) mnemonicKeys.ghost = actions.ghost.sweepToMnemonic(mnemonic)
        //@ts-ignore
      if (!mnemonicKeys.next) mnemonicKeys.next = actions.next.sweepToMnemonic(mnemonic)
      if (!mnemonicKeys.btcSms) {
        //@ts-ignore: strictNullChecks
        mnemonicKeys.btcSms = actions.btcmultisig.getSmsKeyFromMnemonic(mnemonic)
        //@ts-ignore: strictNullChecks
        localStorage.setItem(constants.privateKeyNames.btcSmsMnemonicKeyGenerated, mnemonicKeys.btcSms)
      }
    }
    // Sweep-Switch
    //@ts-ignore: strictNullChecks
    let btcNewSmsMnemonicKey: MnemonicKey = localStorage.getItem(constants.privateKeyNames.btcSmsMnemonicKeyMnemonic)
    
    try { 
      //@ts-ignore: strictNullChecks
      btcNewSmsMnemonicKey = JSON.parse(btcNewSmsMnemonicKey) 
    } catch (e) {
      console.error(e)
    }

    if (!(btcNewSmsMnemonicKey instanceof Array)) {
      localStorage.setItem(constants.privateKeyNames.btcSmsMnemonicKeyMnemonic, JSON.stringify([]))
    }

    //@ts-ignore: strictNullChecks
    let btcNewMultisigOwnerKey: MnemonicKey = localStorage.getItem(constants.privateKeyNames.btcMultisigOtherOwnerKeyMnemonic)
    
    try { 
      //@ts-ignore: strictNullChecks
      btcNewMultisigOwnerKey = JSON.parse(btcNewMultisigOwnerKey) 
    } catch (e) {
      console.error(e)
    }

    if (!(btcNewMultisigOwnerKey instanceof Array)) {
      localStorage.setItem(constants.privateKeyNames.btcMultisigOtherOwnerKeyMnemonic, JSON.stringify([]))
    }

    const btcPrivateKey = localStorage.getItem(constants.privateKeyNames.btc)
    const btcMultisigPrivateKey = localStorage.getItem(constants.privateKeyNames.btcMultisig)
    const ghostPrivateKey = localStorage.getItem(constants.privateKeyNames.ghost)
    const nextPrivateKey = localStorage.getItem(constants.privateKeyNames.next)
    // using ETH wallet info for BNB. They're compatible
    const ABTypePrivateKey = localStorage.getItem(constants.privateKeyNames.eth)

    actions.eth.login(ABTypePrivateKey, mnemonic, mnemonicKeys)
    actions.bnb.login(ABTypePrivateKey, mnemonic, mnemonicKeys)
    //@ts-ignore: strictNullChecks
    const _btcPrivateKey = actions.btc.login(btcPrivateKey, mnemonic, mnemonicKeys)
    //@ts-ignore: strictNullChecks
    const _ghostPrivateKey = actions.ghost.login(ghostPrivateKey, mnemonic, mnemonicKeys)
    //@ts-ignore: strictNullChecks
    const _nextPrivateKey = actions.next.login(nextPrivateKey, mnemonic, mnemonicKeys)

    // btc multisig with 2fa (2of3)
    await sign_btc_2fa(_btcPrivateKey)

    // btc multisig 2of2 user manual sign
    await sign_btc_multisig(_btcPrivateKey)

    // btc multisig with pin protect (2of3)
    await sign_btc_pin(_btcPrivateKey)

    loginWithTokens()

    await getReputation()
  })
}

const loginWithTokens = () => {
  Object.keys(TOKEN_STANDARDS).forEach((key) => {
    const standardObj = TOKEN_STANDARDS[key]
    const privateKey = localStorage.getItem(constants.privateKeyNames[standardObj.currency])
    const standardName = standardObj.standard

    Object.keys(config[standardName]).forEach(tokenName => {
      actions[standardName].login(
        privateKey,
        config[standardName][tokenName].address,
        tokenName,
        config[standardName][tokenName].decimals,
        config[standardName][tokenName].fullName
      )
    })
  })

  reducers.user.setTokenSigned(true)
}

const getReputation = async () => {

  const btcReputationPromise = actions.btc.getReputation()
  const ethReputationPromise = actions.eth.getReputation()
  const ghostReputationPromise = actions.ghost.getReputation()
  const nextReputationPromise = actions.next.getReputation()

  Promise.all([
    btcReputationPromise,
    ethReputationPromise,
    ghostReputationPromise,
    nextReputationPromise,
  ])
    .then(([btcReputation, ethReputation, ghostReputation, nextReputation]) => {
      const totalReputation = Number(btcReputation) + Number(ethReputation) + Number(ghostReputation) + Number(nextReputation)

      if (Number.isInteger(totalReputation)) {
        reducers.pubsubRoom.set({ reputation: totalReputation })
      } else {
        reducers.pubsubRoom.set({ reputation: null })
      }
    })
    .catch((error) => {
      console.error(`unknown reputation`, error)
    })
}


const getBalances = () => {
  const {
    user: {
      isTokenSigned,
    },
  } = getState()

  reducers.user.setIsBalanceFetching({ isBalanceFetching: true })

  return new Promise(async (resolve) => {
    const balances = [
      ...(metamask.isEnabled() && metamask.isConnected())
        ? [ { func: metamask.getBalance, name: 'metamask' } ]
        : [],
      { func: actions.btc.getBalance, name: 'btc' },
      { func: actions.eth.getBalance, name: 'eth' },
      { func: actions.bnb.getBalance, name: 'bnb' },
      { func: actions.ghost.getBalance, name: 'ghost' },
      { func: actions.next.getBalance, name: 'next' },
      { func: actions.btcmultisig.getBalance, name: 'btc-sms' },
      { func: actions.btcmultisig.getBalanceUser, name: 'btc-ms-main' },
      { func: actions.btcmultisig.getBalancePin, name: 'btc-pin' },
      { func: actions.btcmultisig.fetchMultisigBalances, name: 'btc-ms' }
    ]

    balances.forEach(async (obj) => {
      try {
        await obj.func()
      } catch (e) {
        console.error('Fail fetch balance for', obj.name)
      }
    })

    if (isTokenSigned) {
      await getTokensBalances()
    }

    reducers.user.setIsBalanceFetching({ isBalanceFetching: false })
    resolve(true)
  })
}

const getTokensBalances = async () => {
  Object.keys(TOKEN_STANDARDS).forEach((key) => {
    const standardObj = TOKEN_STANDARDS[key]
    const standardName = standardObj.standard
    
    Object.keys(config[standardName]).forEach(async (tokenName) => {
      try {
        await actions[standardName].getBalance(tokenName)
      } catch (error) {
        console.group('Actions >%c user > getTokensBalances', 'color: red;')
        console.error(`Fail fetch balance for ${tokenName.toUpperCase()} token`, error)
        console.groupEnd()
      }
    })
  })
}

const customRate = (cur) => {
  const wTokens = window.widgetERC20Tokens

  const dataobj = wTokens && Object.keys(wTokens).find(el => el === cur.toLowerCase())
  return dataobj ? (wTokens[dataobj] || { customEcxchangeRate: null }).customEcxchangeRate : null
}

const getExchangeRate = (sellCurrency, buyCurrency): Promise<number> => {
  const sellDataRate = customRate(sellCurrency)
  const buyDataRate = customRate(buyCurrency)

  const {
    user,
  } = getState()

  return new Promise((resolve, reject) => {

    if (sellDataRate) {
      resolve(sellDataRate)
      return
    }

    if (buyDataRate) {
      resolve(1 / buyDataRate)
      return
    }

    let dataKey = sellCurrency.toLowerCase()
    switch (sellCurrency.toLowerCase()) {
      case 'btc (sms-protected)':
      case 'btc (multisig)':
      case 'btc (pin-protected)':
        dataKey = 'btc'
        break
    }

    if ((user[`${dataKey}Data`]
      && user[`${dataKey}Data`].infoAboutCurrency
      && user[`${dataKey}Data`].infoAboutCurrency.price_fiat
    ) || (
        user.tokensData[dataKey]
        && user.tokensData[dataKey].infoAboutCurrency
        && user.tokensData[dataKey].infoAboutCurrency.price_fiat
      )
    ) {
      const currencyData = (user.tokensData[dataKey] && user.tokensData[dataKey].infoAboutCurrency)
        ? user.tokensData[dataKey]
        : user[`${dataKey}Data`]

      resolve(currencyData.infoAboutCurrency.price_fiat)
    } else {
      resolve(1)
    }
  })
}

const getInfoAboutCurrency = (currencyNames) => {
  return new Promise((resolve, reject) => {
    const hasCustomRate = (cur) => {
      const dataobj = Object.keys(config.erc20).find(el => el.toLowerCase() === cur.toLowerCase())
      return dataobj ? (config.erc20[dataobj] || { customEcxchangeRate: false }).customEcxchangeRate : false
    }

    const url = 'https://noxon.wpmix.net/cursAll.php'
    reducers.user.setIsFetching({ isFetching: true })

    const fiat = (config && config.opts && config.opts.activeFiat) ? config.opts.activeFiat : `USD`

    request.get(url, {
      cacheResponse: 60 * 60 * 1000, // кеш 1 час
      query: {
        fiat,
        tokens: currencyNames.join(`,`),
      }
    }).then((answer: any) => {
      let infoAboutBTC = answer.data.filter(currencyInfo => {
        if (currencyInfo.symbol.toLowerCase() === 'btc') return true
      })

      const btcPrice = (
        infoAboutBTC
        && infoAboutBTC.length
        && infoAboutBTC[0].quote
        && infoAboutBTC[0].quote[fiat]
        && infoAboutBTC[0].quote[fiat].price
      ) ? infoAboutBTC[0].quote[fiat].price : 7000

      answer.data.map(currencyInfoItem => {
        if (currencyNames.includes(currencyInfoItem.symbol)) {
          if (currencyInfoItem.quote && currencyInfoItem.quote[fiat]) {
            const priceInBtc = currencyInfoItem.quote[fiat].price / btcPrice
            const ownPrice = hasCustomRate(currencyInfoItem.symbol)

            const currencyInfo = {
              ...currencyInfoItem.quote[fiat],
              price_fiat: (ownPrice) ? ownPrice : currencyInfoItem.quote[fiat].price,
              price_btc: priceInBtc,
            }

            switch (currencyInfoItem.symbol) {
              case 'BTC':
                reducers.user.setInfoAboutCurrency({ name: 'btcData', infoAboutCurrency: currencyInfo })
                reducers.user.setInfoAboutCurrency({ name: 'btcMnemonicData', infoAboutCurrency: currencyInfo }) // Sweep (for future)
                reducers.user.setInfoAboutCurrency({ name: 'btcMultisigSMSData', infoAboutCurrency: currencyInfo })
                reducers.user.setInfoAboutCurrency({ name: 'btcMultisigUserData', infoAboutCurrency: currencyInfo })
                reducers.user.setInfoAboutCurrency({ name: 'btcMultisigG2FAData', infoAboutCurrency: currencyInfo })
                reducers.user.setInfoAboutCurrency({ name: 'btcMultisigPinData', infoAboutCurrency: currencyInfo })
                break

              case 'ETH':
                reducers.user.setInfoAboutCurrency({ name: 'ethData', infoAboutCurrency: currencyInfo })
                reducers.user.setInfoAboutCurrency({ name: 'ethMnemonicData', infoAboutCurrency: currencyInfo }) // Sweep (for future)
                break
              
              case 'BNB':
                reducers.user.setInfoAboutCurrency({ name: 'bnbData', infoAboutCurrency: currencyInfo })
                reducers.user.setInfoAboutCurrency({ name: 'bnbMnemonicData', infoAboutCurrency: currencyInfo }) // Sweep (for future)
                break

              case 'GHOST':
                reducers.user.setInfoAboutCurrency({ name: 'ghostData', infoAboutCurrency: currencyInfo })
                reducers.user.setInfoAboutCurrency({ name: 'ghostMnemonicData', infoAboutCurrency: currencyInfo }) // Sweep (for future)
                break

              case 'NEXT':
                reducers.user.setInfoAboutCurrency({ name: 'nextData', infoAboutCurrency: currencyInfo })
                reducers.user.setInfoAboutCurrency({ name: 'nextMnemonicData', infoAboutCurrency: currencyInfo }) // Sweep (for future)
                break

              default:
                if (erc20Like.isToken({ name: currencyInfoItem.symbol })) {
                  reducers.user.setInfoAboutToken({ name: currencyInfoItem.symbol.toLowerCase(), infoAboutCurrency: currencyInfo })
                } else {
                  reducers.user.setInfoAboutCurrency({ name: `${currencyInfoItem.symbol.toLowerCase()}Data`, infoAboutCurrency: currencyInfo })
                }
            }
          }
        }
      })
      resolve(true)
    }).catch((error) => {
      reject(error)
    }).finally(() => reducers.user.setIsFetching({ isFetching: false }))
  })
}


const clearTransactions = () => {
  reducers.history.setTransactions([])
}

const mergeTransactions = (mergeTxs: any[]) => {
  const {
    history: {
      transactions,
    },
  } = getState()
  //@ts-ignore: strictNullChecks
  let data = [].concat(transactions, ...mergeTxs).sort((a, b) => b.date - a.date).filter((item) => item)
  reducers.history.setTransactions(data)
}

const pullActiveCurrency = (currency) => {
  reducers.user.setActiveCurrency({ activeCurrency: currency })
}

const delay = (ms) => new Promise(resolve => setTimeout(() => resolve(true), ms))

const fetchMultisigStatus = async () => {
  const {
    user: {
      btcMultisigUserData: {
        address: mainAddress,
        wallets,
      },
    },
  } = getState()

  actions.multisigTx.fetch(mainAddress)
  if (wallets && wallets.length) {
    wallets.map(({ address }, index) => new Promise(async (resolve) => {
      actions.multisigTx.fetch(address)
      resolve(true)
    }))
  }
}

type ObjCurrencyType = {
  currency: {
    isBalanceFetched: boolean
  }
}

//@ts-ignore: strictNullChecks
const setTransactions = async (objCurrency: ObjCurrencyType | {} = null) => {
  const isBtcSweeped = actions.btc.isSweeped()
  const isEthSweeped = actions.eth.isSweeped()
  const isBnbSweeped = actions.bnb.isSweeped()

  try {
    clearTransactions()

    const fetchTxsPromises = [
      actions.btc.getTransaction(),
      ...(isBtcSweeped) ? [] : [actions.btc.getTransaction(actions.btc.getSweepAddress())],
      actions.btcmultisig.getTransactionSMS(),
      actions.btcmultisig.getTransactionPIN(),
      actions.btcmultisig.getTransactionUser(),
      actions.eth.getTransaction(),
      actions.bnb.getTransaction(),
      //@ts-ignore: strictNullChecks
      ...(metamask.isEnabled() && metamask.isConnected()) ? [actions.eth.getTransaction(metamask.getAddress())] : [],
      //@ts-ignore: strictNullChecks
      ...(metamask.isEnabled() && metamask.isConnected()) ? [actions.bnb.getTransaction(metamask.getAddress())] : [],
      ...(isEthSweeped) ? [] : [actions.eth.getTransaction(actions.eth.getSweepAddress())],
      ...(isBnbSweeped) ? [] : [actions.bnb.getTransaction(actions.bnb.getSweepAddress())],
      ...objCurrency && objCurrency['GHOST'] ? [actions.ghost.getTransaction()] : [],
      ...objCurrency && objCurrency['NEXT'] ? [actions.next.getTransaction()] : [],
    ]

    fetchTxsPromises.forEach((txPromise: Promise<any[]>) => {
      txPromise.then((txList: any[]) => {
        mergeTransactions(txList)
      })
    })

    await setTokensTransaction()
  } catch (error) {
    console.group('Actions >%c user > setTransactions', 'color: red;')
    console.error('error: ', error)
    console.groupEnd()
  }
}

const setTokensTransaction = async () => {
  const { core: { hiddenCoinsList } } = getState()
  const enabledCurrencies = getActivatedCurrencies()
  const tokens: { [key: string]: string[] } = {}

  Object.keys(TOKEN_STANDARDS).forEach((key) => {
    const standard = TOKEN_STANDARDS[key].standard
    const standardTokens = Object.keys(config[standard]).filter((name) => {
      return (
        !hiddenCoinsList.includes(name.toUpperCase()) &&
        enabledCurrencies.includes(name.toUpperCase())
      )
    })

    tokens[standard] = standardTokens
  })

  Object.keys(tokens).forEach((standard) => {
    tokens[standard].forEach((tokenName, index) => {
      const customMs = 650

      delay(customMs * index).then(() => {
        actions[standard].getTransaction(null, tokenName).then((tokenTxs) => {
          mergeTransactions(tokenTxs)
        })
      })
    })
  })
}

const getText = () => {
  const { user: { ethData, bnbData, btcData, ghostData, nextData } } = getState()


  let text = `
  You will need this instruction only in case of emergency (if you lost your keys) \r\n
  please do NOT waste your time and go back to swap.online\r\n
  \r\n
  \r\n
  \r\n
  \r\n
${window.location.hostname} emergency only instruction
\r\n
#ETHEREUM
\r\n
Ethereum address: ${ethData.address}\r\n
Private key: ${ethData.privateKey}\r\n
\r\n
How to access tokens and ethers: \r\n
1. Go here https://www.myetherwallet.com/#send-transaction \r\n
2. Select 'Private key'\r\n
3. paste private key to input and click "unlock"\r\n
\r\n
#BINANCE SMART CHAIN
\r\n
BSC address: ${bnbData.address}\r\n
Private key: ${bnbData.privateKey}\r\n
\r\n
# BITCOIN\r\n
\r\n
Bitcoin address: ${btcData.address}\r\n
Private key: ${btcData.privateKey}\r\n
\r\n
1. Go to blockchain.info\r\n
2. login\r\n
3. Go to settings > addresses > import\r\n
4. paste private key and click "Ok"\r\n
\r\n
# GHOST\r\n
\r\n
Ghost address: ${ghostData.address}\r\n
Private key: ${ghostData.privateKey}\r\n
\r\n
# NEXT\r\n
\r\n
Next address: ${nextData.address}\r\n
Private key: ${nextData.privateKey}\r\n
\r\n
* We don\'t store your private keys and will not be able to restore them!
\r\n
`

  return text
}

export const getWithdrawWallet = (currency, addr) => {
  const needType = getCurrencyKey(currency, true).toUpperCase()

  const filtered = actions.core.getWallets({}).filter((wallet) => {
    const walletType = getCurrencyKey(wallet.currency, true).toUpperCase()

    return (walletType === needType && addr === wallet.address) || (!addr && (walletType === needType))
  })

  return (filtered.length) ? filtered[0] : false
}

export const isOwner = (addr, currency) => {
  const lowerAddr = addr.toLowerCase()

  if (erc20Like.isToken({ name: currency })) {
    const isErc20 = erc20Like.erc20.isToken({ name: currency })
    const isBep20 = erc20Like.bep20.isToken({ name: currency })
    const actionName = isErc20 ? 'eth' : isBep20 ? 'bnb' : 'eth'
    const allAddresses = actions[actionName].getAllMyAddresses()

    if (allAddresses.includes(lowerAddr)) return true

    const { user } = getState()
    const storeOwnerAddress = user[`${actionName}Data`].address.toLowerCase()

    return lowerAddr === storeOwnerAddress
  }

  if (
    //@ts-ignore: strictNullChecks
    actions.btc.getAllMyAddresses().includes(lowerAddr) ||
    //@ts-ignore: strictNullChecks
    actions.ghost.getAllMyAddresses().includes(lowerAddr) ||
    //@ts-ignore: strictNullChecks
    actions.next.getAllMyAddresses().includes(lowerAddr) ||
    actions.eth.getAllMyAddresses().includes(lowerAddr) ||
    actions.bnb.getAllMyAddresses().includes(lowerAddr)
  ) {
    return true
  }

  const name = `${currency.toLowerCase()}Data`
  const { user } = getState()

  if (!user[name]) {
    return false
  }

  const { addrFromStore } = user[name]

  if (!addrFromStore) {
    return false
  }

  return lowerAddr === addrFromStore.toLowerCase()
}


const downloadPrivateKeys = () => {
  const element = document.createElement('a')
  const text = getText()
  const message = 'Check your browser downloads'

  element.setAttribute('href', `data:text/plaincharset=utf-8,${encodeURIComponent(text)}`)
  element.setAttribute('download', `${window.location.hostname}_keys_${moment().format('DD.MM.YYYY')}.txt`)

  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)

  actions.notifications.show(constants.notifications.Message, {
    message,
  })

  localStorage.setItem(constants.localStorage.privateKeysSaved, 'true')
}

window.downloadPrivateKeys = downloadPrivateKeys

const getAuthData = (name) => {
  const { user } = getState()
  return user[`${name}Data`]
}

export default {
  sign,
  sign_btc_2fa,
  sign_btc_pin,
  sign_btc_multisig,
  loginWithTokens,
  getBalances,
  setTransactions,
  downloadPrivateKeys,
  getText,
  isOwner,
  getExchangeRate,
  getReputation,
  getInfoAboutCurrency,
  getAuthData,
  getWithdrawWallet,
  fetchMultisigStatus,
  pullActiveCurrency,
}
