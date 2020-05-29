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

  if (!activeCurrency) reducers.user.setActiveCurrency({ activeCurrency: 'BTC'})
  if (!activeFiat) reducers.user.setActiveFiat({ activeFiat: window.DEFAULT_FIAT || 'USD' })
}

const sign_btc_multisig = async (btcPrivateKey) => {
  let btcMultisigOwnerKey = localStorage.getItem(constants.privateKeyNames.btcMultisigOtherOwnerKey)
  try { btcMultisigOwnerKey = JSON.parse(btcMultisigOwnerKey) } catch (e) { }
  const _btcMultisigPrivateKey = actions.btcmultisig.login_USER(btcPrivateKey, btcMultisigOwnerKey)
  await actions.btcmultisig.signToUserMultisig()
}


const sign_btc_2fa = async (btcPrivateKey) => {
  const btcSMSServerKey = config.swapContract.protectedBtcKey
  let btcSmsPublicKeys = [btcSMSServerKey]
  let btcSmsMnemonicKey = localStorage.getItem(constants.privateKeyNames.btcSmsMnemonicKey)
  try { btcSmsMnemonicKey = JSON.parse(btcSmsMnemonicKey) } catch (e) { }
  if (btcSmsMnemonicKey instanceof Array && btcSmsMnemonicKey.length > 0) {
    btcSmsPublicKeys.push(btcSmsMnemonicKey[0])
  }
  const _btcMultisigSMSPrivateKey = actions.btcmultisig.login_SMS(btcPrivateKey, btcSmsPublicKeys)
}

const sign = async () => {
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
  }

  console.log('actions user - sign', mnemonicKeys, mnemonic)
  if (mnemonic !== `-`) {
    if (!mnemonicKeys.btc) mnemonicKeys.btc = actions.btc.sweepToMnemonic(mnemonic)
    if (!mnemonicKeys.eth) mnemonicKeys.eth = actions.eth.sweepToMnemonic(mnemonic)
    if (!mnemonicKeys.btcSms) {
      mnemonicKeys.btcSms = actions.btcmultisig.getSmsKeyFromMnemonic(mnemonic)
      localStorage.setItem(constants.privateKeyNames.btcSmsMnemonicKeyGenerated, mnemonicKeys.btcSms)
    }
  }
  // Sweep-Switch
  let btcNewSmsMnemonicKey = localStorage.getItem(constants.privateKeyNames.btcSmsMnemonicKeyMnemonic)
  try { btcNewSmsMnemonicKey = JSON.parse(btcNewSmsMnemonicKey) } catch (e) { }
  if (!(btcNewSmsMnemonicKey instanceof Array)) {
    localStorage.setItem(constants.privateKeyNames.btcSmsMnemonicKeyMnemonic, JSON.stringify([]))
  }

  let btcNewMultisigOwnerKey = localStorage.getItem(constants.privateKeyNames.btcMultisigOtherOwnerKeyMnemonic)
  try { btcNewMultisigOwnerKey = JSON.parse(btcNewMultisigOwnerKey) } catch (e) { }
  if (!(btcNewMultisigOwnerKey instanceof Array)) {
    localStorage.setItem(constants.privateKeyNames.btcMultisigOtherOwnerKeyMnemonic, JSON.stringify([]))
  }

  const btcPrivateKey = localStorage.getItem(constants.privateKeyNames.btc)
  const btcMultisigPrivateKey = localStorage.getItem(constants.privateKeyNames.btcMultisig)
  const ethPrivateKey = localStorage.getItem(constants.privateKeyNames.eth)


  const _ethPrivateKey = actions.eth.login(ethPrivateKey, mnemonic, mnemonicKeys)
  const _btcPrivateKey = actions.btc.login(btcPrivateKey, mnemonic, mnemonicKeys)

  // btc multisig with 2fa (2of3)
  await sign_btc_2fa(_btcPrivateKey)

  // btc multisig 2of2 user manual sign
  await sign_btc_multisig(_btcPrivateKey)

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
}

const getReputation = async () => {

  const btcReputationPromise = actions.btc.getReputation()
  const ethReputationPromise = actions.eth.getReputation()

  Promise.all([
    btcReputationPromise,
    ethReputationPromise,
  ])
    .then(([btcReputation, ethReputation]) => {
      const totalReputation = Number(btcReputation) + Number(ethReputation)

      if (Number.isInteger(totalReputation)) {
        reducers.ipfs.set({ reputation: totalReputation })
      }
      else {
        reducers.ipfs.set({ reputation: null })
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
    await actions.eth.getBalance()
    await actions.btc.getBalance()
    await actions.btcmultisig.getBalance() // SMS-Protected
    await actions.btcmultisig.getBalanceUser() // Other user confirm
    await actions.btcmultisig.fetchMultisigBalances()

    if (isTokenSigned) {
      Object.keys(config.erc20)
        .forEach(async (name) => {
          await actions.token.getBalance(name)
        })
    }

    reducers.user.setIsBalanceFetching({ isBalanceFetching: false })
  })
}

const getFiats = () => {
  reducers.user.setActiveFiat({ activeFiat: window.DEFAULT_FIAT || 'USD' })

  return new Promise((resolve, reject) => {

    axios.get(`https://noxon.wpmix.net/worldCurrencyPrices.php`).then(({ data }) => {
      const { quotes } = data

      if (quotes) {
        const fiatsRates = Object.keys(quotes).map(el => {
          const key = el
          return ({ key: key.slice(3), value: quotes[key] })
        })
        const fiats = fiatsRates.map(({ key }) => key)

        reducers.user.setFiats({ fiats })

        resolve({ fiatsRates, fiats })
      }
    }).catch(e => console.error(e))
  })

}

const getExchangeRate = (sellCurrency, buyCurrency) => {

  if (buyCurrency.toLowerCase() === 'usd') {
    return new Promise((resolve, reject) => {
      let dataKey = sellCurrency.toLowerCase()
      switch (sellCurrency.toLowerCase()) {
        case 'btc (sms-protected)':
        case 'btc (multisig)':
          dataKey = 'btc'
          break
        default:
      }
      const { user } = getState()
      if (user[`${dataKey}Data`] && user[`${dataKey}Data`].infoAboutCurrency) {
        const currencyData = user[`${dataKey}Data`]
        const multiplier = getFiats()
        resolve(currencyData.infoAboutCurrency.price_usd)
      } else {
        resolve(1)
      }
    })
  }
  return new Promise((resolve, reject) => {
    const url = `https://api.cryptonator.com/api/full/${sellCurrency}-${buyCurrency}`

    request.get(url, { cacheResponse: 60000 }).then(({ ticker: { price: exchangeRate } }) => {
      resolve(exchangeRate)
    })
      .catch(() => {
        if (constants.customEcxchangeRate[sellCurrency.toLowerCase()] !== undefined) {
          resolve(constants.customEcxchangeRate[sellCurrency])
        } else {
          resolve(1)
        }
      })
  })
}

const getDemoMoney = process.env.MAINNET ? () => { } : () => {
  // googe bitcoin (or rinkeby) faucet
  request.get('https://swap.wpmix.net/demokeys.php', {})
    .then((r) => {
      window.localStorage.clear()
      localStorage.setItem(constants.privateKeyNames.btc, r[0])
      localStorage.setItem(constants.privateKeyNames.eth, r[1])
      localStorage.setItem(constants.localStorage.demoMoneyReceived, true)
      window.location.reload()
    })
}


const getInfoAboutCurrency = (currencyNames) =>

  new Promise((resolve, reject) => {
    const url = 'https://noxon.wpmix.net/cursAll.php'
    reducers.user.setIsFetching({ isFetching: true })

    request.get(url, {
      cacheResponse: 60 * 60 * 1000, // кеш 1 час
    }).then((answer) => {
      let infoAboutBTC = answer.data.filter(currencyInfo => {
        if (currencyInfo.symbol.toLowerCase() === 'btc') return true
      })
      const btcPrice = (
        infoAboutBTC
        && infoAboutBTC.length
        && infoAboutBTC[0].quote
        && infoAboutBTC[0].quote.USD
        && infoAboutBTC[0].quote.USD.price
      ) ? infoAboutBTC[0].quote.USD.price : 7000

      answer.data.map(currencyInfoItem => {
        if (currencyNames.includes(currencyInfoItem.symbol)) {
          if (currencyInfoItem.quote && currencyInfoItem.quote.USD) {
            const priceInBtc = currencyInfoItem.quote.USD.price / btcPrice
            const currencyInfo = {
              ...currencyInfoItem.quote.USD,
              price_usd: currencyInfoItem.quote.USD.price,
              price_btc: priceInBtc,
            }

            switch (currencyInfoItem.symbol) {
              case 'BTC': {
                reducers.user.setInfoAboutCurrency({ name: 'btcData', infoAboutCurrency: currencyInfo })
                reducers.user.setInfoAboutCurrency({ name: 'btcMnemonicData', infoAboutCurrency: currencyInfo }) // Sweep (for future)
                reducers.user.setInfoAboutCurrency({ name: 'btcMultisigSMSData', infoAboutCurrency: currencyInfo })
                reducers.user.setInfoAboutCurrency({ name: 'btcMultisigUserData', infoAboutCurrency: currencyInfo })
                reducers.user.setInfoAboutCurrency({ name: 'btcMultisigG2FAData', infoAboutCurrency: currencyInfo })
                break
              }
              case 'ETH': {
                reducers.user.setInfoAboutCurrency({ name: 'ethData', infoAboutCurrency: currencyInfo })
                reducers.user.setInfoAboutCurrency({ name: 'ethMnemonicData', infoAboutCurrency: currencyInfo }) // Sweep (for future)
                break
              }
              default: {
                if (ethToken.isEthToken( { name: currencyInfoItem.symbol } )) {
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

const setTransactions = async () => {
  const isBtcSweeped = actions.btc.isSweeped()
  const isEthSweeped = actions.eth.isSweeped()

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
      actions.btc.getTransaction(),
      ...(isBtcSweeped) ? [] : [actions.btc.getTransaction(actions.btc.getSweepAddress())],
      // actions.btc.getInvoices(),
      // ... (isBtcSweeped) ? [] : [actions.btc.getInvoices(actions.btc.getSweepAddress())],
      actions.btcmultisig.getTransactionSMS(),
      // actions.btcmultisig.getInvoicesSMS(),
      actions.btcmultisig.getTransactionUser(),
      // actions.btcmultisig.getInvoicesUser(),
      // actions.usdt.getTransaction(),
      actions.eth.getTransaction(),
      ...(isEthSweeped) ? [] : [actions.eth.getTransaction(actions.eth.getSweepAddress())],
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
      pullTransactions([...mainTokens, ...ercTokens])
    })
  } catch (error) {
    console.error('getTransError: ', error)
  }
}

const getText = () => {
  const { user: { ethData, btcData } } = getState()


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
  if (actions.eth.getAllMyAddresses().indexOf(addr.toLowerCase()) !== -1) return true

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

  localStorage.setItem(constants.localStorage.privateKeysSaved, true)
}

window.downloadPrivateKeys = downloadPrivateKeys

const getAuthData = (name) => {
  const { user } = getState()
  return user[`${name}Data`]
}

export default {
  sign,
  sign_btc_2fa,
  sign_btc_multisig,
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
  getFiats,
  fetchMultisigStatus,
  pullActiveCurrency,
}
