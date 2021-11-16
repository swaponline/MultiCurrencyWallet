import { BigNumber } from 'bignumber.js'
import erc20Like from 'common/erc20Like'
import config from 'app-config'
import moment from 'moment/moment'
import request from 'common/utils/request'
import getCoinInfo from 'common/coins/getCoinInfo'
import * as mnemonicUtils from 'common/utils/mnemonic'
import { MnemonicKey } from 'common/types'
import { constants, links, transactions, user, getCurrencyKey, metamask } from 'helpers'
import TOKEN_STANDARDS from 'helpers/constants/TOKEN_STANDARDS'
import actions from 'redux/actions'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'

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
  actions.btcmultisig.login_USER(btcPrivateKey, btcMultisigOwnerKey)
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
  actions.btcmultisig.login_SMS(btcPrivateKey, btcSmsPublicKeys)
}

const sign_btc_pin = async (btcPrivateKey) => {
  const btcPinServerKey = config.swapContract.btcPinKey
  const btcPinPublicKeys = [btcPinServerKey]
  const btcPinMnemonicKey: MnemonicKey | null = localStorage.getItem(constants.privateKeyNames.btcPinMnemonicKey)

  if (btcPinMnemonicKey) {
    btcPinPublicKeys.push(btcPinMnemonicKey)
  }

  actions.btcmultisig.login_PIN(btcPrivateKey, btcPinPublicKeys)
}

const sign = async () => {
  await metamask.web3connect.onInit( async () => {
    initReducerState()

    let mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)

    if (!mnemonic) {
      mnemonic = mnemonicUtils.getRandomMnemonicWords()
      localStorage.setItem(constants.privateKeyNames.twentywords, mnemonic)
    }

    const btcPrivateKey = localStorage.getItem(constants.privateKeyNames.btc)
    const ghostPrivateKey = localStorage.getItem(constants.privateKeyNames.ghost)
    const nextPrivateKey = localStorage.getItem(constants.privateKeyNames.next)
    // using ETH key for all EVM compatible chains
    const ethPrivateKey = localStorage.getItem(constants.privateKeyNames.eth)

    actions.eth.login(ethPrivateKey, mnemonic)
    actions.bnb.login(ethPrivateKey, mnemonic)
    actions.matic.login(ethPrivateKey, mnemonic)
    actions.arbeth.login(ethPrivateKey, mnemonic)
    const _btcPrivateKey = actions.btc.login(btcPrivateKey, mnemonic)
    actions.ghost.login(ghostPrivateKey, mnemonic)
    actions.next.login(nextPrivateKey, mnemonic)

    // btc multisig with 2fa (2of3)
    await sign_btc_2fa(_btcPrivateKey)

    // btc multisig 2of2 user manual sign
    await sign_btc_multisig(_btcPrivateKey)

    // btc multisig with pin protect (2of3)
    await sign_btc_pin(_btcPrivateKey)

    loginWithTokens()
  })
}

const loginWithTokens = () => {
  Object.keys(TOKEN_STANDARDS).forEach((key) => {
    const standardObj = TOKEN_STANDARDS[key]
    const privateKey = localStorage.getItem(constants.privateKeyNames.eth) // for eth like blockchain use eth private key
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

const getBalances = () => {
  const {
    user: {
      isTokenSigned,
      isBalanceFetching,
    },
  } = getState()

  if (isBalanceFetching) return true

  reducers.user.setIsBalanceFetching({ isBalanceFetching: true })

  return new Promise(async (resolve) => {
    const balances = [
      ...(metamask.isEnabled() && metamask.isConnected() && metamask.isAvailableNetwork())
        ? [ { func: metamask.getBalance, name: 'metamask' } ]
        : [],
      { func: actions.btc.getBalance, name: 'btc' },
      { func: actions.eth.getBalance, name: 'eth' },
      { func: actions.bnb.getBalance, name: 'bnb' },
      { func: actions.matic.getBalance, name: 'matic' },
      { func: actions.arbeth.getBalance, name: 'arbeth' },
      { func: actions.ghost.getBalance, name: 'ghost' },
      { func: actions.next.getBalance, name: 'next' },
      { func: actions.btcmultisig.getBalance, name: 'btc-sms' },
      { func: actions.btcmultisig.getBalanceUser, name: 'btc-ms-main' },
      { func: actions.btcmultisig.getBalancePin, name: 'btc-pin' },
      { func: actions.btcmultisig.fetchMultisigBalances, name: 'btc-ms' }
    ]

    await Promise.all(
      balances.map(async (obj) => {
        try {
          await obj.func()
        } catch (e) {
          console.error('Fail fetch balance for ', obj.name)
        }
      })
    )

    if (isTokenSigned) {
      await getTokensBalances()
    }

    reducers.user.setIsBalanceFetching({ isBalanceFetching: false })
    resolve(true)
  })
}

const getTokensBalances = async () => {
  await Promise.all(
    Object.keys(TOKEN_STANDARDS).map(async (key) => {
      const standardObj = TOKEN_STANDARDS[key]
      const standardName = standardObj.standard

      await Promise.all(
        Object.keys(config[standardName]).map(async (tokenName) => {
          try {
            await actions[standardName].getBalance(tokenName)
          } catch (error) {
            console.group('Actions >%c user > getTokensBalances', 'color: red;')
            console.error(`Fail fetch balance for ${tokenName.toUpperCase()} token`, error)
            console.groupEnd()
          }
        })
      )
    })
  )
}

const customRate = (cur) => {
  const widgetTokens = window.widgetEvmLikeTokens

  const targetToken = widgetTokens?.length && widgetTokens.find((token) => {
    return token.name.toLowerCase() === cur.toLowerCase()
  })

  return targetToken ? (targetToken || { customExchangeRate: null }).customExchangeRate : null
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
      resolve(new BigNumber(1).div(buyDataRate).toNumber())
      return
    }

    let dataKey = sellCurrency.toLowerCase()
    switch (sellCurrency.toLowerCase()) {
      case 'btc (multisig)':
      case 'btc (pin-protected)':
        dataKey = 'btc'
        break
    }

    if (
      (user[`${dataKey}Data`]?.infoAboutCurrency?.price_fiat) ||
      (user.tokensData[dataKey]?.infoAboutCurrency?.price_fiat)
    ) {
      const currencyData = (user.tokensData[dataKey] && user.tokensData[dataKey].infoAboutCurrency)
        ? user.tokensData[dataKey]
        : user[`${dataKey}Data`]

      resolve(currencyData.infoAboutCurrency.price_fiat)
    } else {
      resolve(0)
    }
  })
}

const customTokenExchangeRate = (name) => {
  for (const key in TOKEN_STANDARDS) {
    const standard = TOKEN_STANDARDS[key].standard

    if (config[standard][name.toLowerCase()]) {
      return config[standard][name.toLowerCase()].customExchangeRate || ''
    }
  }

  return ''
}

const getInfoAboutCurrency = (currencyNames) => {
  return new Promise((resolve, reject) => {
    reducers.user.setIsFetching({ isFetching: true })

    const fiat = (config && config.opts && config.opts.activeFiat) ? config.opts.activeFiat : `USD`

    request.get(links.currencyCourses, {
      cacheResponse: 60 * 60 * 1000, // cache for 1 hour
      query: {
        fiat,
        tokens: currencyNames.map(currencyNames => {
          const { coin } = getCoinInfo(currencyNames)
          return coin
        }).join(`,`),
      }
    }).then((answer: any) => {
      let infoAboutBTC = answer.data.filter(currencyInfo => {
        return currencyInfo.symbol.toLowerCase() === 'btc'
      })

      const btcPrice = infoAboutBTC?.length && infoAboutBTC[0]?.quote[fiat]?.price

      const { user } = getState()

      currencyNames.map(name => {
        const {
          coin,
          blockchain,
        } = getCoinInfo(name)

        const currencyName = coin.toLowerCase()

        const currencyInfoItem = answer.data.filter(currencyInfo => {
          return currencyInfo.symbol.toLowerCase() === currencyName
        })[0]

        const customFiatPrice = customTokenExchangeRate(currencyName)

        const isToken = erc20Like.isToken({ name: currencyName })

        if (currencyInfoItem?.quote[fiat]) {
          const priceInFiat =  customFiatPrice || currencyInfoItem.quote[fiat].price
          const priceInBtc = btcPrice && priceInFiat / btcPrice

          const currencyInfo = {
            ...currencyInfoItem.quote[fiat],
            price_fiat: priceInFiat,
            price_btc: priceInBtc,
          }

          const targetDataKey = `${currencyName}Data`

          if (user[targetDataKey]) {
            reducers.user.setInfoAboutCurrency({ name: targetDataKey, infoAboutCurrency: currencyInfo })

            if (currencyInfoItem.symbol === 'BTC') {
              reducers.user.setInfoAboutCurrency({ name: 'btcMultisigUserData', infoAboutCurrency: currencyInfo })
              reducers.user.setInfoAboutCurrency({ name: 'btcMultisigG2FAData', infoAboutCurrency: currencyInfo })
              reducers.user.setInfoAboutCurrency({ name: 'btcMultisigPinData', infoAboutCurrency: currencyInfo })
            }
          } else if (isToken && blockchain) {
            reducers.user.setInfoAboutToken({
              baseCurrency: blockchain.toLowerCase(),
              name: currencyName,
              infoAboutCurrency: currencyInfo,
            })
          }
        }

        if (!currencyInfoItem && customFiatPrice && isToken && blockchain) {
          const priceInFiat = +customFiatPrice
          const priceInBtc = btcPrice && priceInFiat / btcPrice

          const currencyInfo = {
            price_fiat: priceInFiat,
            price_btc: priceInBtc,
          }

          reducers.user.setInfoAboutToken({
            baseCurrency: blockchain.toLowerCase(),
            name: currencyName,
            infoAboutCurrency: currencyInfo,
          })
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

const mergeTransactions = (mergeTxs: IUniversalObj[]) => {
  const {
    history: {
      transactions,
    },
  } = getState()

  const allTransactions = transactions
    .concat(mergeTxs)
    .filter((item) => item)

  actions.history.pullTransactions(allTransactions)
}

const pullActiveCurrency = (currency) => {
  reducers.user.setActiveCurrency({ activeCurrency: currency })
}

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
  clearTransactions()

  try {
    const fetchTxsPromises = [
      actions.btc.getTransaction(),
      actions.btcmultisig.getTransactionSMS(),
      actions.btcmultisig.getTransactionPIN(),
      actions.btcmultisig.getTransactionUser(),
      actions.eth.getTransaction(),
      actions.bnb.getTransaction(),
      actions.matic.getTransaction(),
      actions.arbeth.getTransaction(),
      actions.ghost.getTransaction(),
      actions.next.getTransaction(),
      ...(metamask.isEnabled() && metamask.isConnected()) ? [actions.eth.getTransaction(metamask.getAddress())] : [],
      ...(metamask.isEnabled() && metamask.isConnected()) ? [actions.bnb.getTransaction(metamask.getAddress())] : [],
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
  Object.keys(TOKEN_STANDARDS).forEach((key) => {
    const standard = TOKEN_STANDARDS[key].standard
    const baseCurrency = TOKEN_STANDARDS[standard].currency.toUpperCase()

    Object.keys(config[standard]).filter((name) => {
      const tokenKey = `{${baseCurrency}}${name}`.toUpperCase()

      if (user.isAllowedCurrency(tokenKey)) {
        actions[standard].getTransaction(false, name).then((trx) => {
          if (trx.length) mergeTransactions(trx)
        })
      }
    })
  })
}

const getText = () => {
  const {
    user: {
      ethData,
      bnbData,
      maticData,
      arbethData,
      btcData,
      ghostData,
      nextData,
    }
  } = getState()

  let text = `
    You will need this instruction only in case of emergency (if you lost your keys)\r\n
    please do NOT waste your time and go back to swap.online
    \r\n
    \r\n
    ${window.location.hostname} emergency only instruction
    \r\n
    # ETHEREUM
    \r\n
    Ethereum address: ${ethData.address}\r\n
    Private key: ${ethData.privateKey}\r\n
    \r\n
    How to access tokens and ethers: \r\n
    1. Go here https://www.myetherwallet.com/#send-transaction \r\n
    2. Select 'Private key'\r\n
    3. paste private key to input and click "unlock"\r\n
    \r\n
    # BINANCE SMART CHAIN
    \r\n
    BSC address: ${bnbData.address}\r\n
    Private key: ${bnbData.privateKey}\r\n
    \r\n
    # MATIC CHAIN
    \r\n
    MATIC address: ${maticData.address}\r\n
    Private key: ${maticData.privateKey}\r\n
    \r\n
    # ARBITRUM CHAIN
    \r\n
    ARBITRUM address: ${arbethData.address}\r\n
    Private key: ${arbethData.privateKey}\r\n
    \r\n
    # BITCOIN
    \r\n
    Bitcoin address: ${btcData.address}\r\n
    Private key: ${btcData.privateKey}\r\n
    \r\n
    1. Go to blockchain.info\r\n
    2. login\r\n
    3. Go to settings > addresses > import\r\n
    4. paste private key and click "Ok"\r\n
    \r\n
    # GHOST
    \r\n
    Ghost address: ${ghostData.address}\r\n
    Private key: ${ghostData.privateKey}\r\n
    \r\n
    # NEXT
    \r\n
    Next address: ${nextData.address}\r\n
    Private key: ${nextData.privateKey}\r\n
    \r\n
    * We don\'t store your private keys and will not be able to restore them!
    \r\n
  `

  return text
}

export const getWithdrawWallet = (currency, addressOwner) => {
  const needType = getCurrencyKey(currency, true).toUpperCase()

  const filtered = actions.core.getWallets().filter((wallet) => {
    const walletName = wallet.tokenKey || wallet.currency
    const walletType = getCurrencyKey(walletName, true).toUpperCase()

    return (
      (walletType === needType && addressOwner === wallet.address) ||
      (!addressOwner && (walletType === needType))
    )
  })

  return (filtered.length) ? filtered[0] : false
}

export const isOwner = (addr, currency) => {
  const lowerAddr = addr.toLowerCase()
  const baseTokenCurrency = transactions.getTokenBaseCurrency(currency)

  if (baseTokenCurrency) {
    const allAddresses = actions[baseTokenCurrency].getAllMyAddresses()

    if (allAddresses.includes(lowerAddr)) return true

    const { user } = getState()
    const storeOwnerAddress = user[`${baseTokenCurrency}Data`].address.toLowerCase()

    return lowerAddr === storeOwnerAddress
  }

  const currencyActions = actions[currency.toLowerCase()]

  if (currencyActions?.getAllMyAddresses().includes(lowerAddr)) {
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
  getInfoAboutCurrency,
  getAuthData,
  getWithdrawWallet,
  fetchMultisigStatus,
  pullActiveCurrency,
}
