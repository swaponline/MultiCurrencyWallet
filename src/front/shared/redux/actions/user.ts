import config from 'app-config'
import moment from 'moment/moment'
import { request, constants, ethToken } from 'helpers'

import actions from 'redux/actions'
import { getState } from 'redux/core'

import reducers from 'redux/core/reducers'
import * as bip39 from 'bip39'
import axios from 'axios'

import { getActivatedCurrencies } from 'helpers/user'
import getCurrencyKey from 'helpers/getCurrencyKey'
import apiLooper from 'helpers/apiLooper'

import metamask from 'helpers/metamask'


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
  //@ts-ignore
  if (!activeFiat) reducers.user.setActiveFiat({ activeFiat: window.DEFAULT_FIAT || 'USD' })
}

const sign_btc_multisig = async (btcPrivateKey) => {
  let btcMultisigOwnerKey = localStorage.getItem(constants.privateKeyNames.btcMultisigOtherOwnerKey)
  try { btcMultisigOwnerKey = JSON.parse(btcMultisigOwnerKey) } catch (e) { }
  //@ts-ignore
  const _btcMultisigPrivateKey = actions.btcmultisig.login_USER(btcPrivateKey, btcMultisigOwnerKey)
  await actions.btcmultisig.signToUserMultisig()
}


const sign_btc_2fa = async (btcPrivateKey) => {
  const btcSMSServerKey = config.swapContract.protectedBtcKey
  let btcSmsPublicKeys = [btcSMSServerKey]
  let btcSmsMnemonicKey = localStorage.getItem(constants.privateKeyNames.btcSmsMnemonicKey)
  try { btcSmsMnemonicKey = JSON.parse(btcSmsMnemonicKey) } catch (e) { }
  //@ts-ignore
  if (btcSmsMnemonicKey instanceof Array && btcSmsMnemonicKey.length > 0) {
    btcSmsPublicKeys.push(btcSmsMnemonicKey[0])
  }
  const _btcMultisigSMSPrivateKey = actions.btcmultisig.login_SMS(btcPrivateKey, btcSmsPublicKeys)
}

const sign_btc_pin = async (btcPrivateKey) => {
  const btcPinServerKey = config.swapContract.btcPinKey
  let btcPinPublicKeys = [btcPinServerKey]

  let btcPinMnemonicKey = localStorage.getItem(constants.privateKeyNames.btcPinMnemonicKey)
  try { btcPinMnemonicKey = JSON.parse(btcPinMnemonicKey) } catch (e) { }
  //@ts-ignore
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
      mnemonic = bip39.generateMnemonic()
      localStorage.setItem(constants.privateKeyNames.twentywords, mnemonic)
    }

    const mnemonicKeys = {
      btc: localStorage.getItem(constants.privateKeyNames.btcMnemonic),
      btcSms: localStorage.getItem(constants.privateKeyNames.btcSmsMnemonicKeyGenerated),
      eth: localStorage.getItem(constants.privateKeyNames.ethMnemonic),
      ghost: localStorage.getItem(constants.privateKeyNames.ghostMnemonic),
      next: localStorage.getItem(constants.privateKeyNames.nextMnemonic),
    }
    console.log('actions user - sign', mnemonicKeys, mnemonic)
    if (mnemonic !== `-`) {
      //@ts-ignore
      if (!mnemonicKeys.btc) mnemonicKeys.btc = actions.btc.sweepToMnemonic(mnemonic)
      //@ts-ignore
      if (!mnemonicKeys.eth) mnemonicKeys.eth = actions.eth.sweepToMnemonic(mnemonic)
      //@ts-ignore
      if (!mnemonicKeys.ghost) mnemonicKeys.ghost = actions.ghost.sweepToMnemonic(mnemonic)
        //@ts-ignore
      if (!mnemonicKeys.next) mnemonicKeys.next = actions.next.sweepToMnemonic(mnemonic)
      if (!mnemonicKeys.btcSms) {
        mnemonicKeys.btcSms = actions.btcmultisig.getSmsKeyFromMnemonic(mnemonic)
        localStorage.setItem(constants.privateKeyNames.btcSmsMnemonicKeyGenerated, mnemonicKeys.btcSms)
      }
    }
    // Sweep-Switch
    let btcNewSmsMnemonicKey = localStorage.getItem(constants.privateKeyNames.btcSmsMnemonicKeyMnemonic)
    try { btcNewSmsMnemonicKey = JSON.parse(btcNewSmsMnemonicKey) } catch (e) { }
    //@ts-ignore
    if (!(btcNewSmsMnemonicKey instanceof Array)) {
      localStorage.setItem(constants.privateKeyNames.btcSmsMnemonicKeyMnemonic, JSON.stringify([]))
    }

    let btcNewMultisigOwnerKey = localStorage.getItem(constants.privateKeyNames.btcMultisigOtherOwnerKeyMnemonic)
    try { btcNewMultisigOwnerKey = JSON.parse(btcNewMultisigOwnerKey) } catch (e) { }
    //@ts-ignore
    if (!(btcNewMultisigOwnerKey instanceof Array)) {
      localStorage.setItem(constants.privateKeyNames.btcMultisigOtherOwnerKeyMnemonic, JSON.stringify([]))
    }

    const btcPrivateKey = localStorage.getItem(constants.privateKeyNames.btc)
    const btcMultisigPrivateKey = localStorage.getItem(constants.privateKeyNames.btcMultisig)
    const ethPrivateKey = localStorage.getItem(constants.privateKeyNames.eth)
    const ghostPrivateKey = localStorage.getItem(constants.privateKeyNames.ghost)
    const nextPrivateKey = localStorage.getItem(constants.privateKeyNames.next)


    const _ethPrivateKey = actions.eth.login(ethPrivateKey, mnemonic, mnemonicKeys)
    const _btcPrivateKey = actions.btc.login(btcPrivateKey, mnemonic, mnemonicKeys)
    const _ghostPrivateKey = actions.ghost.login(ghostPrivateKey, mnemonic, mnemonicKeys)
    const _nextPrivateKey = actions.next.login(nextPrivateKey, mnemonic, mnemonicKeys)

    // btc multisig with 2fa (2of3)
    await sign_btc_2fa(_btcPrivateKey)

    // btc multisig 2of2 user manual sign
    await sign_btc_multisig(_btcPrivateKey)

    // btc multisig with pin protect (2of3)
    await sign_btc_pin(_btcPrivateKey)

    // if inside actions.token.login to call web3.eth.accounts.privateKeyToAccount passing public key instead of private key
    // there will not be an error, but the address returned will be wrong
    // if (!isEthKeychainActivated) {
    Object.keys(config.erc20)
      .forEach(name => {
        actions.token.login(_ethPrivateKey, config.erc20[name].address, name, config.erc20[name].decimals, config.erc20[name].fullName)
      })
    // }
    reducers.user.setTokenSigned(true)

    // const getReputation = actions.user.getReputation()

    await getReputation()
  })
}

const sign_to_tokens = () => {
  const ethPrivateKey = localStorage.getItem(constants.privateKeyNames.eth)
  Object.keys(config.erc20)
    .forEach(name => {
      actions.token.login(ethPrivateKey, config.erc20[name].address, name, config.erc20[name].decimals, config.erc20[name].fullName)
    })
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
      { func: actions.eth.getBalance, name: 'eth' },
      { func: actions.btc.getBalance, name: 'btc' },
      { func: actions.ghost.getBalance, name: 'ghost' },
      { func: actions.next.getBalance, name: 'next' },
      { func: actions.btcmultisig.getBalance, name: 'btc-sms' },
      { func: actions.btcmultisig.getBalanceUser, name: 'btc-ms-main' },
      { func: actions.btcmultisig.getBalancePin, name: 'btc-pin' },
      { func: actions.btcmultisig.fetchMultisigBalances, name: 'btc-ms' }
    ]

    balances.forEach(async (obj) => {
      try {
        //@ts-ignore
        await obj.func()
      } catch (e) {
        console.error('Fail fetch balance for', obj.name)
      }
    })

    if (isTokenSigned) {
      Object.keys(config.erc20)
        .forEach(async (name) => { 
          try {
            await actions.token.getBalance(name)
          } catch (e) {
            console.error('Fail fetch balance for token', name, e)
          }
        })
    }

    reducers.user.setIsBalanceFetching({ isBalanceFetching: false })
    resolve(true)
  })
}

const customRate = (cur) => {
  //@ts-ignore
  const wTokens = window.widgetERC20Tokens

  const dataobj = wTokens && Object.keys(wTokens).find(el => el === cur.toLowerCase())
  return dataobj ? (wTokens[dataobj] || { customEcxchangeRate: null }).customEcxchangeRate : null
}

const getExchangeRate = (sellCurrency, buyCurrency) => {
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
      default:
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

const getDemoMoney = process.env.MAINNET ? () => { } : () => {
  // googe bitcoin (or rinkeby) faucet
  request.get('https://swap.wpmix.net/demokeys.php', {})
    .then((r) => {
      window.localStorage.clear()
      localStorage.setItem(constants.privateKeyNames.btc, r[0])
      localStorage.setItem(constants.privateKeyNames.eth, r[1])
      localStorage.setItem(constants.privateKeyNames.ghost, r[2])
      localStorage.setItem(constants.privateKeyNames.next, r[3])
      //@ts-ignore
      localStorage.setItem(constants.localStorage.demoMoneyReceived, true)
      window.location.reload()
    })
}


const getInfoAboutCurrency = (currencyNames) =>

  new Promise((resolve, reject) => {

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
    }).then((answer) => {
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
              case 'BTC': {
                reducers.user.setInfoAboutCurrency({ name: 'btcData', infoAboutCurrency: currencyInfo })
                reducers.user.setInfoAboutCurrency({ name: 'btcMnemonicData', infoAboutCurrency: currencyInfo }) // Sweep (for future)
                reducers.user.setInfoAboutCurrency({ name: 'btcMultisigSMSData', infoAboutCurrency: currencyInfo })
                reducers.user.setInfoAboutCurrency({ name: 'btcMultisigUserData', infoAboutCurrency: currencyInfo })
                reducers.user.setInfoAboutCurrency({ name: 'btcMultisigG2FAData', infoAboutCurrency: currencyInfo })
                reducers.user.setInfoAboutCurrency({ name: 'btcMultisigPinData', infoAboutCurrency: currencyInfo })
                break
              }
              case 'ETH': {
                reducers.user.setInfoAboutCurrency({ name: 'ethData', infoAboutCurrency: currencyInfo })
                reducers.user.setInfoAboutCurrency({ name: 'ethMnemonicData', infoAboutCurrency: currencyInfo }) // Sweep (for future)
                break
              }
              case 'GHOST': {
                reducers.user.setInfoAboutCurrency({ name: 'ghostData', infoAboutCurrency: currencyInfo })
                reducers.user.setInfoAboutCurrency({ name: 'ghostMnemonicData', infoAboutCurrency: currencyInfo }) // Sweep (for future)
                break
              }
              case 'NEXT': {
                reducers.user.setInfoAboutCurrency({ name: 'nextData', infoAboutCurrency: currencyInfo })
                reducers.user.setInfoAboutCurrency({ name: 'nextMnemonicData', infoAboutCurrency: currencyInfo }) // Sweep (for future)
                break
              }
              default: {
                if (ethToken.isEthToken({ name: currencyInfoItem.symbol })) {
                  reducers.user.setInfoAboutToken({ name: currencyInfoItem.symbol.toLowerCase(), infoAboutCurrency: currencyInfo })
                } else {
                  reducers.user.setInfoAboutCurrency({ name: `${currencyInfoItem.symbol.toLowerCase()}Data`, infoAboutCurrency: currencyInfo })
                }
                break
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


const pullTransactions = transactions => {

  let data = [].concat([], ...transactions).sort((a, b) => b.date - a.date).filter((item) => item)
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

const setTransactions = async (objCurrency = null) => {
  /* 
    objCurrency = {
      currency: {
        isBalanceFetched: bool
      }
    }
    
    "GHOST",
    "NEXT"
    "ETH"
    "BTC"
    "BTC (SMS-Protected)"
    "BTC (PIN-Protected)"
    "BTC (Google 2FA)"
    "BTC (Multisig)"
    "USDT",
    "ETH"
  */

  const isBtcSweeped = actions.btc.isSweeped()
  const isEthSweeped = actions.eth.isSweeped()
  const isGhostSweeped = actions.ghost.isSweeped()
  const isNextSweeped = actions.next.isSweeped()

  const {
    core: { hiddenCoinsList },
  } = getState()
  const enabledCurrencies = getActivatedCurrencies()

  /*
    fetching penging btc-ms txs
  */

  try {
    // @ToDo - make in like query
    const mainTokens = await Promise.all([
      //@ts-ignore
      actions.btc.getTransaction(),
      //@ts-ignore
      ...(isBtcSweeped) ? [] : [actions.btc.getTransaction(actions.btc.getSweepAddress())],
      // actions.btc.getInvoices(),
      // ... (isBtcSweeped) ? [] : [actions.btc.getInvoices(actions.btc.getSweepAddress())],
      //@ts-ignore
      actions.btcmultisig.getTransactionSMS(),
      //@ts-ignore
      actions.btcmultisig.getTransactionPIN(),
      // actions.btcmultisig.getInvoicesSMS(),
      //@ts-ignore
      actions.btcmultisig.getTransactionUser(),
      // actions.btcmultisig.getInvoicesUser(),
      // actions.usdt.getTransaction(),
      //@ts-ignore
      actions.eth.getTransaction(),
      //@ts-ignore
      ...(metamask.isEnabled() && metamask.isConnected()) ? [actions.eth.getTransaction(metamask.getAddress())] : [],
      //@ts-ignore
      ...(isEthSweeped) ? [] : [actions.eth.getTransaction(actions.eth.getSweepAddress())],
      //@ts-ignore
      objCurrency && objCurrency['GHOST'].isBalanceFetched ? actions.ghost.getTransaction() : [],
      //@ts-ignore
      ...(isGhostSweeped && !(objCurrency && objCurrency['GHOST'].isBalanceFetched)) ? [] : [actions.ghost.getTransaction(actions.ghost.getSweepAddress())],
      //@ts-ignore
      actions.next.getTransaction(),
      //@ts-ignore
      ...(isNextSweeped) ? [] : [actions.next.getTransaction(actions.next.getSweepAddress())],
      // actions.eth.getInvoices(),
      // ... (isEthSweeped) ? [] : [actions.eth.getTransaction(actions.eth.getSweepAddress())],
    ])

    const erc20 = Object.keys(config.erc20)
      .filter((key) => !hiddenCoinsList.includes(key.toUpperCase()) && enabledCurrencies.includes(key.toUpperCase()))

    await new Promise(async resolve => {
      const ercArray = await Promise.all(erc20
        .map(async (name, index) => {
          await delay(650 * index)
          const res = await actions.token.getTransaction(null, name)
          // console.log('name - ', name, '\n', '\n', res)
          return res
        }))
      return resolve(ercArray)
    }).then((ercTokens) => {
      //@ts-ignore
      pullTransactions([...mainTokens.filter(arr => arr.length), ...ercTokens])
    })
  } catch (error) {
    console.error('getTransError: ', error)
  }
}

const getText = () => {
  const { user: { ethData, btcData, ghostData, nextData } } = getState()


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
Ethereum address: ${ethData.address}  \r\n
Private key: ${ethData.privateKey}\r\n
\r\n
How to access tokens and ethers: \r\n
1. Go here https://www.myetherwallet.com/#send-transaction \r\n
2. Select 'Private key'\r\n
3. paste private key to input and click "unlock"\r\n
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

  const filtered = actions.core.getWallets().filter((wallet) => {
    const walletType = getCurrencyKey(wallet.currency, true).toUpperCase()

    return (walletType === needType && addr === wallet.address) || (!addr && (walletType === needType))
  })

  return (filtered.length) ? filtered[0] : false
}

export const isOwner = (addr, currency) => {
  if (ethToken.isEthToken({ name: currency })) {
    if (actions.eth.getAllMyAddresses().indexOf(addr.toLowerCase()) !== -1) return true
    const {
      user: {
        ethData: {
          address,
        },
      },
    } = getState()

    return addr === address
  }

  if (actions.btc.getAllMyAddresses().indexOf(addr.toLowerCase()) !== -1) return true
  if (actions.ghost.getAllMyAddresses().indexOf(addr.toLowerCase()) !== -1) return true
  if (actions.next.getAllMyAddresses().indexOf(addr.toLowerCase()) !== -1) return true
  if (actions.eth.getAllMyAddresses().indexOf(addr.toLowerCase()) !== -1) return true

  if (metamask
    && metamask.isEnabled()
    && metamask.isConnected()
    && metamask.getAddress().toLowerCase() == addr.toLowerCase()
  ) return true

  const name = `${currency.toLowerCase()}Data`
  const { user } = getState()

  if (!user[name]) {
    return false
  }

  const { address } = user[name]

  if (!address) {
    return false
  }

  return addr === address
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
  //@ts-ignore
  localStorage.setItem(constants.localStorage.privateKeysSaved, true)
}
//@ts-ignore
window.downloadPrivateKeys = downloadPrivateKeys

const getAuthData = (name) => {
  const { user } = getState()
  return user[`${name}Data`]
}

const addMessagingToken = (token) => {
  console.log(12313123123)
  console.log(token)
  console.log(12313123123)
  reducers.user.addMessagingToken({ token })
}

export default {
  sign,
  sign_btc_2fa,
  sign_btc_pin,
  sign_btc_multisig,
  sign_to_tokens,
  getBalances,
  getDemoMoney,
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
  addMessagingToken,
}
