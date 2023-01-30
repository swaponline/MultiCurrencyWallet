import { BigNumber } from 'bignumber.js'
import config from 'helpers/externalConfig'
import moment from 'moment/moment'
import request from 'common/utils/request'
import getCoinInfo from 'common/coins/getCoinInfo'
import * as mnemonicUtils from 'common/utils/mnemonic'
import { MnemonicKey } from 'common/types'
import { constants, links, transactions, user, getCurrencyKey, metamask } from 'helpers'
import TOKEN_STANDARDS, { EXISTING_STANDARDS } from 'helpers/constants/TOKEN_STANDARDS'
import actions from 'redux/actions'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import { getActivatedCurrencies } from 'helpers/user'


const onlyEvmWallets = (config?.opts?.ui?.disableInternalWallet) ? true : false
const enabledCurrencies = config.opts.curEnabled

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
  // @ts-ignore: strictNullChecks
  try { btcMultisigOwnerKey = JSON.parse(btcMultisigOwnerKey) } catch (e) { }
  // @ts-ignore
  actions.btcmultisig.login_USER(btcPrivateKey, btcMultisigOwnerKey)
  await actions.btcmultisig.signToUserMultisig()
}

const sign_btc_2fa = async (btcPrivateKey) => {
  const btcSMSServerKey = config.swapContract.protectedBtcKey
  const btcSmsPublicKeys = [btcSMSServerKey]
  // @ts-ignore: strictNullChecks
  let btcSmsMnemonicKey: MnemonicKey = localStorage.getItem(constants.privateKeyNames.btcSmsMnemonicKey)

  try {
    // @ts-ignore: strictNullChecks
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
  await metamask.web3connect.onInit(async () => {
    initReducerState()

    let mnemonic = localStorage.getItem(constants.privateKeyNames.twentywords)
    let needGenerateShamirSecret = false
    const shamirsMnemonics = localStorage.getItem(constants.privateKeyNames.shamirsMnemonics)

    if (!mnemonic) {
      mnemonic = mnemonicUtils.getRandomMnemonicWords()
      localStorage.setItem(constants.privateKeyNames.twentywords, mnemonic)
      needGenerateShamirSecret = true
    } else if (mnemonic !== `-`) {
      needGenerateShamirSecret = true
    }
    // Generate Shamir's Secret-Sharing for Mnemonic Codes
    if (needGenerateShamirSecret && !shamirsMnemonics) {
      const shamirsSharing = mnemonicUtils.splitMnemonicToSecretParts(mnemonic)
      localStorage.setItem(constants.privateKeyNames.shamirsMnemonics, JSON.stringify(shamirsSharing.mnemonics))
      localStorage.setItem(
        constants.privateKeyNames.shamirsSecrets,
        JSON.stringify(
          shamirsSharing.secretParts.map((secretPart) => secretPart.toString())
        )
      )
    }

    const btcPrivateKey = localStorage.getItem(constants.privateKeyNames.btc)
    const ghostPrivateKey = localStorage.getItem(constants.privateKeyNames.ghost)
    const nextPrivateKey = localStorage.getItem(constants.privateKeyNames.next)
    // using ETH key for all EVM compatible chains
    const ethPrivateKey = localStorage.getItem(constants.privateKeyNames.eth)

    Object.keys(config.enabledEvmNetworks).forEach((evmNetworkKey) => {
      const actionKey = evmNetworkKey?.toLowerCase()
      if (actionKey) actions[actionKey]?.login(ethPrivateKey, mnemonic)
    })

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
  EXISTING_STANDARDS.forEach((standard) => {
    // for eth like blockchain use eth private key
    const privateKey = localStorage.getItem(constants.privateKeyNames.eth)

    Object.keys(config[standard]).forEach(tokenName => {
      actions[standard].login(
        privateKey,
        config[standard][tokenName].address,
        tokenName,
        config[standard][tokenName].decimals,
        config[standard][tokenName].fullName,
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

  const evmBalancesFuncs: Array<any> = []
  Object.keys(config.enabledEvmNetworks).forEach((evmType) => {
    if (!enabledCurrencies || enabledCurrencies[evmType.toLowerCase()]) {
      if ((onlyEvmWallets && metamask.isEnabled() && metamask.isConnected()) || !onlyEvmWallets) {
        evmBalancesFuncs.push({
          func: actions[evmType.toLowerCase()].getBalance,
          name: evmType.toLowerCase(),
        })
      }
    }
  })

  return new Promise(async (resolve) => {
    const balances = [
      ...(metamask.isEnabled() && metamask.isConnected() && metamask.isAvailableNetwork())
        ? [ { func: metamask.getBalance, name: 'metamask' } ]
        : [],
      ...(((!enabledCurrencies || enabledCurrencies.btc) && !onlyEvmWallets) ? [{ func: actions.btc.getBalance, name: 'btc' }] : []),

      ...evmBalancesFuncs,

      ...(((!enabledCurrencies || enabledCurrencies.ghost) && !onlyEvmWallets) ? [{ func: actions.ghost.getBalance, name: 'ghost' }] : []),
      ...(((!enabledCurrencies || enabledCurrencies.next) && !onlyEvmWallets) ? [{ func: actions.next.getBalance, name: 'next' }] : []),
      ...(((!enabledCurrencies || enabledCurrencies.btc) && !onlyEvmWallets) ? [{ func: actions.btcmultisig.getBalance, name: 'btc-sms' }] : []),
      ...(((!enabledCurrencies || enabledCurrencies.btc) && !onlyEvmWallets) ? [{ func: actions.btcmultisig.getBalanceUser, name: 'btc-ms-main' }] : []),
      ...(((!enabledCurrencies || enabledCurrencies.btc) && !onlyEvmWallets) ? [{ func: actions.btcmultisig.getBalancePin, name: 'btc-pin' }] : []),
      ...(((!enabledCurrencies || enabledCurrencies.btc) && !onlyEvmWallets) ? [{ func: actions.btcmultisig.fetchMultisigBalances, name: 'btc-ms' }] : []),
    ]

    await Promise.all(
      balances.map(async (obj) => {
        try {
          await obj.func()
        } catch (e) {
          console.error('Fail fetch balance for ', obj.name)
        }
      }),
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
    EXISTING_STANDARDS.map(async (standard) => {
      const { currency } = TOKEN_STANDARDS[standard]

      if (!enabledCurrencies || enabledCurrencies[currency.toLowerCase()]) {
        if ((onlyEvmWallets && metamask.isEnabled() && metamask.isConnected()) || !onlyEvmWallets) {
          await Promise.all(
            Object.keys(config[standard]).map(async (tokenName) => {
              try {
                await actions[standard].getBalance(tokenName)
              } catch (error) {
                console.group('Actions >%c user > getTokensBalances', 'color: red;')
                console.error(`Fail fetch balance for ${tokenName.toUpperCase()} token`, error)
                console.groupEnd()
              }
            }),
          )
        }
      }
    }),
  )
}

const customRate = (cur) => {
  const widgetTokens = window.widgetEvmLikeTokens

  const targetToken = widgetTokens?.length
    && widgetTokens.find((token) => token.name.toLowerCase() === cur.toLowerCase())

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
      (user[`${dataKey}Data`]?.infoAboutCurrency?.price_fiat)
      || (user.tokensData[dataKey]?.infoAboutCurrency?.price_fiat)
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
    const { standard } = TOKEN_STANDARDS[key]

    if (config[standard][name.toLowerCase()]) {
      return config[standard][name.toLowerCase()].customExchangeRate || ''
    }
  }

  return ''
}

const getInfoAboutPHI = (fiat, btcPrice) => new Promise((resolve, reject) => {
  request.get(`https://price.phi.network/api/ticker`,{
    cacheResponse: 60 * 60 * 1000, // cache for 1 hour
    query: {
      filter: `WPHI`,
    },
  }).then((apiData: any) => {
    if (apiData
      && apiData.data
      && apiData.data.WPHI
      && apiData.data.quotes
      && apiData.data.quotes[fiat]
    ) {

      const currencyInfoItem = apiData.data
      const priceInFiat = currencyInfoItem.quotes[fiat].price
      const priceInBtc = priceInFiat / btcPrice

      const currencyInfo = {
        ...currencyInfoItem.quotes[fiat],
        price_fiat: priceInFiat,
        price_btc: priceInBtc,
      }

      reducers.user.setInfoAboutCurrency({ name: `phiData`, infoAboutCurrency: currencyInfo })
      reducers.user.setInfoAboutCurrency({ name: `phi_v2Data`, infoAboutCurrency: currencyInfo })
    }
    resolve(true)
  }).catch((error) => {
    reject(error)
  })
})

const getInfoAboutCurrency = (currencyNames) => new Promise(async (resolve, reject) => {
  reducers.user.setIsFetching({ isFetching: true })

  const fiat = config?.opts?.activeFiat || `USD`

  request.get(links.currencyCourses, {
    cacheResponse: 60 * 60 * 1000, // cache for 1 hour
    query: {
      fiat,
      tokens: currencyNames.map(currencyNames => {
        let { coin } = getCoinInfo(currencyNames)
        if (coin === 'XDAI') coin = 'DAI'

        return coin
      }).join(`,`),
    },
  }).then((answer: any) => {
    const infoAboutBTC = answer.data.filter(currencyInfo => currencyInfo.symbol.toLowerCase() === 'btc')

    const btcPrice = infoAboutBTC?.length && infoAboutBTC[0]?.quote[fiat]?.price

    const { user } = getState()

    currencyNames.map((name) => {
      const {
        coin,
        blockchain,
      } = getCoinInfo(name)

      const currencyName = coin.replaceAll(`*`,``).toLowerCase()

      const currencyInfoItem = answer.data.filter(currencyInfo => (
        (currencyInfo.symbol.toLowerCase() === currencyName)
        || (currencyName === 'xdai' && currencyInfo.symbol.toLowerCase() === 'dai')
        || (currencyName === 'phi_v2' && currencyInfo.symbol.toLowerCase() === 'phi')
        || (config?.L2_EVM_KEYS?.includes(currencyName) && currencyInfo.symbol.toLowerCase() === 'eth')
      ))[0]

      const customFiatPrice = customTokenExchangeRate(currencyName)

      if (currencyInfoItem?.quote[fiat]) {
        // @To-do, в будущем, если будут просить свои цены, нужно перенести скрипт cursAll в вордпресс и делать правки там
        let curExchangeRate = 1
        switch (currencyName) {
          case 'phi_v2':
          case 'phi':
            curExchangeRate = 19486972
            break
        }
        
        const priceInFiat =  customFiatPrice || currencyInfoItem.quote[fiat].price * curExchangeRate
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
        } else if (user.tokensData[name.toLowerCase()] && blockchain) {
          reducers.user.setInfoAboutToken({
            baseCurrency: blockchain.toLowerCase(),
            name: coin.toLowerCase(),
            infoAboutCurrency: currencyInfo,
          })
        }
      }

      if (!currencyInfoItem && blockchain) {
        if (customFiatPrice) { // set custom rate
          const priceInFiat = +customFiatPrice
          const priceInBtc = btcPrice && priceInFiat / btcPrice

          const currencyInfo = {
            price_fiat: priceInFiat,
            price_btc: priceInBtc,
          }

          reducers.user.setInfoAboutToken({
            baseCurrency: blockchain.toLowerCase(),
            name: coin.toLowerCase(),
            infoAboutCurrency: currencyInfo,
          })
        } else { // remove custom rate
          reducers.user.setInfoAboutToken({
            baseCurrency: blockchain.toLowerCase(),
            name: coin.toLowerCase(),
            infoAboutCurrency: undefined,
          })
        }
      }
    })
    if (currencyNames.includes('phi') || currencyNames.includes('phi_v2')) {
      getInfoAboutPHI(fiat, btcPrice).then((isOk) => { /* Ok */ }).catch((e) => { console.log('Fail fetch Prices for PHI',e) })
    }
    resolve(true)
  }).catch((error) => {
    reject(error)
  }).finally(() => reducers.user.setIsFetching({ isFetching: false }))
})

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

  const evmTransactions: any = []
  Object.keys(config.enabledEvmNetworks).forEach((evmType) => {
    if (!enabledCurrencies || enabledCurrencies[evmType.toLowerCase()]) {
      if (onlyEvmWallets) {
        if (metamask.isEnabled() && metamask.isConnected()) {
          evmTransactions.push( actions[evmType.toLowerCase()].getTransaction(metamask.getAddress()) )
        }
      } else {
        evmTransactions.push( actions[evmType.toLowerCase()].getTransaction() )
        if (metamask.isEnabled() && metamask.isConnected()) {
          evmTransactions.push( actions[evmType.toLowerCase()].getTransaction(metamask.getAddress()) )
        }
      }
    }
  })
  try {
    const fetchTxsPromises = [
      ...(((!enabledCurrencies || enabledCurrencies.btc) && !onlyEvmWallets) ? [actions.btc.getTransaction()] : []),
      ...(((!enabledCurrencies || enabledCurrencies.btc) && !onlyEvmWallets) ? [actions.btcmultisig.getTransactionSMS()] : []),
      ...(((!enabledCurrencies || enabledCurrencies.btc) && !onlyEvmWallets) ? [actions.btcmultisig.getTransactionPIN()] : []),
      ...(((!enabledCurrencies || enabledCurrencies.btc) && !onlyEvmWallets) ? [actions.btcmultisig.getTransactionUser()] : []),
      ...evmTransactions,
      ...(((!enabledCurrencies || enabledCurrencies.ghost) && !onlyEvmWallets) ? [actions.ghost.getTransaction()] : []),
      ...(((!enabledCurrencies || enabledCurrencies.next) && !onlyEvmWallets) ? [actions.next.getTransaction()] : []),
      // @to-do - other metamask wallets? need check
      /*
      ...(metamask.isEnabled() && metamask.isConnected()) ? [actions.eth.getTransaction(metamask.getAddress())] : [],
      ...(metamask.isEnabled() && metamask.isConnected()) ? [actions.bnb.getTransaction(metamask.getAddress())] : [],
      */
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
  EXISTING_STANDARDS.forEach((standard) => {
    const { currency } = TOKEN_STANDARDS[standard]

    if (!enabledCurrencies || enabledCurrencies[currency.toLowerCase()]) {
      Object.keys(config[standard]).filter((name) => {
        const tokenKey = `{${currency.toUpperCase()}}${name}`.toUpperCase()

        if (user.isAllowedCurrency(tokenKey)) {
          actions[standard].getTransaction(false, name).then((trx) => {
            if (trx.length) mergeTransactions(trx)
          })
        }
      })
    }
  })
}

const getText = () => {
  const {
    user: {
      ethData,
      bnbData,
      maticData,
      arbethData,
      aurethData,
      xdaiData,
      ftmData,
      avaxData,
      movrData,
      oneData,
      phiData,
      phi_v2Data,
      ameData,
      btcData,
      ghostData,
      nextData,
    },
  } = getState()

  const text = `
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
    # AURORA CHAIN
    \r\n
    AURORA address: ${aurethData.address}\r\n
    Private key: ${aurethData.privateKey}\r\n
    \r\n
    # XDAI CHAIN
    \r\n
    XDAI address: ${xdaiData.address}\r\n
    Private key: ${xdaiData.privateKey}\r\n
    \r\n
    # FTM CHAIN
    \r\n
    FTM address: ${ftmData.address}\r\n
    Private key: ${ftmData.privateKey}\r\n
    \r\n
    # AVAX CHAIN
    \r\n
    AVAX address: ${avaxData.address}\r\n
    Private key: ${avaxData.privateKey}\r\n
    \r\n
    # MOVR CHAIN
    \r\n
    MOVR address: ${movrData.address}\r\n
    Private key: ${movrData.privateKey}\r\n
    \r\n
    # ONE CHAIN
    \r\n
    ONE address: ${oneData.address}\r\n
    Private key: ${oneData.privateKey}\r\n
    # PHI CHAIN
    \r\n
    PHI address: ${phiData.address}\r\n
    Private key: ${phiData.privateKey}\r\n
    \r\n
    # PHIv2 CHAIN
    \r\n
    PHIv2 address: ${phi_v2Data.address}\r\n
    Private key: ${phi_v2Data.privateKey}\r\n
    \r\n
    
    # AME CHAIN
    \r\n
    AME address: ${ameData.address}\r\n
    Private key: ${ameData.privateKey}\r\n
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
      (walletType === needType && addressOwner === wallet.address)
      || (!addressOwner && (walletType === needType))
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

const restoreWallet = async (mnemonic) => {
  const addAllEnabledWalletsAfterRestoreOrCreateSeedPhrase = config?.opts?.addAllEnabledWalletsAfterRestoreOrCreateSeedPhrase

  // Backup critical localStorage
  const backupMark = actions.btc.getMainPublicKey()

  actions.backupManager.backup(backupMark, false, true)
  // clean mnemonic, if exists
  localStorage.setItem(constants.privateKeyNames.twentywords, '-')
  localStorage.setItem(constants.privateKeyNames.shamirsMnemonics, '-')
  localStorage.setItem(constants.privateKeyNames.shamirsSecrets, '-')

  const btcWallet = await actions.btc.getWalletByWords(mnemonic)
  // Check - if exists backup for this mnemonic
  const restoryMark = btcWallet.publicKey

  if (actions.backupManager.exists(restoryMark)) {
    actions.backupManager.restory(restoryMark)
  }

  localStorage.setItem(constants.localStorage.isWalletCreate, 'true')

  Object.keys(config.enabledEvmNetworks).forEach(async (evmNetworkKey) => {
    const actionKey = evmNetworkKey?.toLowerCase()
    if (actionKey) await actions[actionKey]?.login(false, mnemonic)
  })

  await actions.ghost.login(false, mnemonic)
  await actions.next.login(false, mnemonic)


  const btcPrivKey = await actions.btc.login(false, mnemonic)
  const btcPubKey = actions.btcmultisig.getSmsKeyFromMnemonic(mnemonic)
  //@ts-ignore: strictNullChecks
  localStorage.setItem(constants.privateKeyNames.btcSmsMnemonicKeyGenerated, btcPubKey)
  //@ts-ignore: strictNullChecks
  localStorage.setItem(constants.privateKeyNames.btcPinMnemonicKey, btcPubKey)
  
  if (!addAllEnabledWalletsAfterRestoreOrCreateSeedPhrase) {
    await sign_btc_2fa(btcPrivKey)
    await sign_btc_multisig(btcPrivKey)
  }

  actions.core.markCoinAsVisible('BTC', true)

  const result: any = await actions.btcmultisig.isPinRegistered(mnemonic)

  if (result?.exist) {
    actions.core.markCoinAsVisible('BTC (PIN-Protected)', true)
  }

  if (addAllEnabledWalletsAfterRestoreOrCreateSeedPhrase) {

    const currencies = getActivatedCurrencies()
    currencies.forEach((currency) => {
      if (
        currency !== 'BTC (PIN-Protected)'
      ) {
        actions.core.markCoinAsVisible(currency.toUpperCase(), true)
      }
    })

  } else {

    await getBalances()
    const allWallets = actions.core.getWallets({ withInternal: true })
    allWallets.forEach((wallet) => {
      if (new BigNumber(wallet.balance).isGreaterThan(0)) {
        actions.core.markCoinAsVisible(
          wallet.isToken ? wallet.tokenKey.toUpperCase() : wallet.currency,
          true,
        )
      }
    })
  }
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
  restoreWallet,
}
