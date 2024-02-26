import reducers from 'redux/core/reducers'
import actions from 'redux/actions'
import { getState } from 'redux/core'
import SwapApp from 'swap.app'
import Swap from 'swap.swap'
import getCoinInfo from 'common/coins/getCoinInfo'
import helpers, { constants } from 'helpers'
import Pair from 'pages/Exchange/Orders/Pair'
import config from 'helpers/externalConfig'
import { BigNumber } from 'bignumber.js'

import metamask from 'helpers/metamask'
import { AddressType } from 'domain/address'

import TOKEN_STANDARDS from 'helpers/constants/TOKEN_STANDARDS'


const debug = (...args) => console.log(...args)

const getOrders = (orders) => {
  reducers.core.getOrders({ orders })
  actions.core.addCurrencyFromOrders(orders)
}

const addCurrencyFromOrders = (orders) => {
  if (config && config.isWidget) return // НЕ добавляем валюты из ордеров в режиме виджета

  // Зачем только это???
  // Если в reducers.currencies.partialItems забыли добавить?
  // Так там автоматически генерирует....
  // TODO Проверить зависимости и удалить

  const currenciesGetState = getState().currencies
  const allCurrencyies = currenciesGetState.items.map((item) => item.name.toLowerCase()) // все валюты достпуные в клиенте
  const partialCurrency = currenciesGetState.partialItems // получаем все премиальные валюты

  const sellOrderArray = orders.map((item) => item.sellCurrency.toLowerCase()) // получаем из ордерова валюты на продажу
  const buyOrderArray = orders.map((item) => item.buyCurrency.toLowerCase()) // получаем из ордерова валюты на покупку

  let sortedArray = [...sellOrderArray] // записываем sellOrderArray в массив

  // terators/generators require regenerator-runtime
  for (const sellCurrency of sellOrderArray) {
    // eslint-disable-line
    for (const buyCurrency of buyOrderArray) {
      // eslint-disable-line
      if (sellCurrency !== buyCurrency) {
        if (!sellOrderArray.includes(sellCurrency)) {
          sortedArray.push(sellCurrency.toLowerCase())
        } else if (!sellOrderArray.includes(buyCurrency)) {
          sortedArray.push(buyCurrency.toLowerCase())
        }
      }
    }
  }

  let hasUpdates = false

  sortedArray.forEach((item) => {
    // добавляем объект в дроп, еще раз проверяя, на совпадения
    if (!partialCurrency.map((item) => item.name.toLowerCase()).includes(item)) {
      if (allCurrencyies.includes(item)) {
        // не пускаю валюты не существующие в клиенте
        hasUpdates = true
        partialCurrency.push({
          name: item.toUpperCase(),
          title: item.toUpperCase(),
          icon: item.toLowerCase(),
          value: item.toLowerCase(),
        })
      }
    }
  })

  if (hasUpdates) {
    reducers.currencies.updatePartialItems(partialCurrency)
  }
}
//@ts-ignore
const getSwapById = (id) => new Swap(id, SwapApp.shared())

const getUserData = (currency) => {
  const { user } = getState()
  const targetData = user[`${currency.toLowerCase()}Data`]

  if (targetData) {
    return targetData
  }

  return {}
}

const setFilter = (filter) => {
  reducers.core.setFilter({ filter })
}

const acceptRequest = (orderId, participantPeer) => {
  //@ts-ignore: strictNullChecks
  const order = SwapApp.shared().services.orders.getByKey(orderId)
  order.acceptRequest(participantPeer)
}

const declineRequest = (orderId, participantPeer) => {
  //@ts-ignore: strictNullChecks
  const order = SwapApp.shared().services.orders.getByKey(orderId)
  order.declineRequest(participantPeer)
}

const rememberOrder = (orderId) => {
  reducers.rememberedOrders.savedOrders(orderId)
  localStorage.setItem(
    constants.localStorage.savedOrders,
    JSON.stringify(getState().rememberedOrders.savedOrders)
  )
}

const saveDeletedOrder = (orderId) => {
  reducers.rememberedOrders.deletedOrders(orderId)
  localStorage.setItem(
    constants.localStorage.deletedOrders,
    JSON.stringify(getState().rememberedOrders.deletedOrders)
  )
}

const forgetOrders = (orderId) => {
  reducers.rememberedOrders.forgetOrders(orderId)
  localStorage.setItem(
    constants.localStorage.savedOrders,
    JSON.stringify(getState().rememberedOrders.savedOrders)
  )
}

const removeOrder = (orderId) => {
  actions.feed.deleteItemToFeed(orderId)
  //@ts-ignore: strictNullChecks
  SwapApp.shared().services.orders.remove(orderId)
  actions.core.updateCore()
}

const showMyOrders = () => {
  //@ts-ignore: strictNullChecks
  SwapApp.shared().services.orders.showMyOrders()
}

const hideMyOrders = () => {
  //@ts-ignore: strictNullChecks
  SwapApp.shared().services.orders.hideMyOrders()
}

const deletedPartialCurrency = (orderId) => {
  //@ts-ignore: strictNullChecks
  const deletedOrder = SwapApp.shared().services.orders.getByKey(orderId)
  const deletedOrderSellCurrency = deletedOrder.sellCurrency
  const deletedOrderBuyCurrency = deletedOrder.buyCurrency
  //@ts-ignore: strictNullChecks
  const orders = SwapApp.shared().services.orders.items

  const deletedOrderSell = orders.filter(
    (item) => item.sellCurrency.toUpperCase() === deletedOrderSellCurrency
  )
  const deletedOrderBuy = orders.filter(
    (item) => item.buyCurrency.toUpperCase() === deletedOrderBuyCurrency
  )

  // currencies which must be all time in the drop-down
  const premiumCurrencies = [
    ...Object.keys(config.enabledEvmNetworks),
    'BTC',
    'GHOST',
    'NEXT',
    'SWAP',
  ]

  if (deletedOrderSell.length === 1 && !premiumCurrencies.includes(deletedOrderSellCurrency)) {
    reducers.currencies.deletedPartialCurrency(deletedOrderSellCurrency)
  } else if (deletedOrderBuy.length === 1 && !premiumCurrencies.includes(deletedOrderBuyCurrency)) {
    reducers.currencies.deletedPartialCurrency(deletedOrderBuyCurrency)
  }
}

//@ts-ignore: strictNullChecks
const hasHiddenOrders = () => SwapApp.shared().services.orders.hasHiddenOrders()

const sendRequest = (orderId, destination = {}, callback) => {
  //@ts-ignore
  const { address: destinationAddress } = destination

  //@ts-ignore: strictNullChecks
  const order = SwapApp.shared().services.orders.getByKey(orderId)
  const { address, reputation, reputationProof } = getUserData(order.buyCurrency)

  const requestOptions = {
    address: destinationAddress,
    participantMetadata: {
      address,
      reputation,
      reputationProof,
    },
  }

  order.sendRequest(callback, requestOptions)
}

const sendRequestForPartial = (orderId, newValues, destination = {}, callback) => {
  //@ts-ignore
  const { address: destinationAddress } = destination

  //@ts-ignore: strictNullChecks
  const order = SwapApp.shared().services.orders.getByKey(orderId)

  const { address, reputation, reputationProof } = getUserData(order.buyCurrency)

  const requestOptions = {
    address: destinationAddress,
    participantMetadata: {
      address,
      reputation,
      reputationProof,
    },
  }

  order.sendRequestForPartial(
    newValues,
    requestOptions,
    (newOrder, isAccepted) => {
      console.log('newOrder', newOrder)
      console.log('isAccepted', isAccepted)

      callback(newOrder, isAccepted)
    },
    (oldOrder, newOrder) => {
      //@ts-ignore: strictNullChecks
      const oldPrice = Pair.fromOrder(oldOrder).price
      //@ts-ignore: strictNullChecks
      const newPrice = Pair.fromOrder(newOrder).price

      console.log('prices', oldPrice.toString(), newPrice.toString())
      // | new - old | / old < 5%
      return newPrice.minus(oldPrice).abs().div(oldPrice).isLessThanOrEqualTo(0.05)
    }
  )
}

const createOrder = (data, isPartial = false) => {
  //@ts-ignore: strictNullChecks
  const order = SwapApp.shared().services.orders.create(data)

  if (!order) return

  if (!isPartial) {
    return order
  }

  actions.core.setupPartialOrder(order)
  return order
}

const setupPartialOrder = (order) => {
  const pairData = Pair.fromOrder(order)

  if (!pairData || !pairData.price) {
    return
  }

  const { price } = pairData

  order.setRequestHandlerForPartial('sellAmount', ({ sellAmount }, oldOrder) => {
    const oldPair = Pair.fromOrder(oldOrder)
    debug('oldPair', oldPair)

    // if BID, then
    // price == buyAmount / sellAmount

    //@ts-ignore: strictNullChecks
    const buyAmount = oldPair.isBid() ? sellAmount.div(price) : sellAmount.times(price)

    debug('newBuyAmount', buyAmount)

    const newOrder = { sellAmount, buyAmount }
    debug('newOrder', newOrder)

    return newOrder
  })

  order.setRequestHandlerForPartial('buyAmount', ({ buyAmount }, oldOrder) => {
    const oldPair = Pair.fromOrder(oldOrder)
    debug('oldPair', oldPair)

    // BUY [main] = SELL [base] CURRENCY
    // price = [main]/[base] = [buy]/[sell]

    // BUY 10 ETH = SELL 1 BTC
    // price = 10 = buyAmount / sellAmount
    // newSellAmount = buyAmount / price

    //@ts-ignore: strictNullChecks
    const sellAmount = oldPair.isBid() ? buyAmount.times(price) : buyAmount.div(price)

    debug('newSellAmount', sellAmount)

    const newOrder = { sellAmount, buyAmount }
    debug('newOrder', newOrder)

    return newOrder
  })
}

const initPartialOrders = () => {
  //@ts-ignore: strictNullChecks
  SwapApp.shared().services.orders.items.forEach((order) => {
    if (order && order.isMy && order.isPartial) {
      actions.core.setupPartialOrder(order)
    }
  })
}

const requestToPeer = (event, peer, data, callback) => {
  //@ts-ignore: strictNullChecks
  SwapApp.shared().services.orders.requestToPeer(event, peer, data, callback)
}

const updateCore = () => {
  SwapApp.onInit(() => {
    //@ts-ignore: strictNullChecks
    const orders = SwapApp.shared().services.orders.items

    getOrders(orders)

    actions.feed.getFeedDataFromOrder(orders)
  })
}

const getSwapHistory = () => {
  //@ts-ignore: strictNullChecks
  const swapId = JSON.parse(localStorage.getItem('swapId'))

  if (swapId === null || swapId.length === 0) {
    return
  }

  const historySwap = swapId.map((item) => getInformationAboutSwap(item))

  reducers.history.setSwapHistory(historySwap)
}

const getInformationAboutSwap = (swapId) => {
  if (swapId.length > 0 && typeof swapId === 'string') {
    return {
      //@ts-ignore: strictNullChecks
      ...SwapApp.shared().env.storage.getItem(`swap.${swapId}`),
      //@ts-ignore: strictNullChecks
      ...SwapApp.shared().env.storage.getItem(`flow.${swapId}`),
    }
  }
}

const getHiddenCoins = () => getState().core.hiddenCoinsList || []

const markCoinAsHidden = (coin, doBackup = false) => {
  let list = getState().core.hiddenCoinsList || []
  if (!list.includes(coin)) {
    reducers.core.markCoinAsHidden(coin)
    localStorage.setItem(
      constants.localStorage.hiddenCoinsList,
      JSON.stringify(getState().core.hiddenCoinsList)
    )

    if (doBackup) {
      actions.backupManager.serverBackup()
    }
  }
}

const markCoinAsVisible = (coin, doBackup = false) => {
  const { hiddenCoinsList } = constants.localStorage

  const findedCoin = JSON.parse(localStorage.getItem(hiddenCoinsList) || '[]').find(
    (el) => {
      if (el.includes(':')) {
        const [elCoin, elAddress] = el.split(':')
        return elCoin === coin
      }
    }
  )

  reducers.core.markCoinAsVisible(findedCoin || coin)
  localStorage.setItem(hiddenCoinsList, JSON.stringify(getState().core.hiddenCoinsList))

  if (doBackup) {
    actions.backupManager.serverBackup()
  }
}

type GetWalletParams = {
  currency?: string
  address?: string
  addressType?: string
  connected?: boolean
  blockchain?: string
}

const getWallet = (params: GetWalletParams) => {
  // specify addressType,
  // otherwise it finds the first wallet from all origins, including metamask
  const { address, addressType, connected, currency: currencyData, blockchain: optBlockchain } = params
  const wallets = getWallets({ withInternal: true })

  const {
    coin: currency,
    blockchain: coinBlockchain,
  } = getCoinInfo(currencyData)
  const blockchain = coinBlockchain || optBlockchain

  const founded = wallets.filter((wallet) => {
    if (wallet.isMetamask && !wallet.isConnected) return false
    const conditionOk = (
        blockchain && wallet.blockchain
          ? blockchain.toLowerCase() === wallet.blockchain.toLowerCase()
          : true
      )
      && currency
      && wallet.currency.toLowerCase() === currency.toLowerCase()
      && (blockchain ? currencyData?.toLowerCase() === wallet.tokenKey : true)

    if (address && wallet.address.toLowerCase() === address.toLowerCase()) {
      return conditionOk
    }

    if (addressType) {
      if (
        (addressType === AddressType.Internal && !wallet.isMetamask) ||
        (
          addressType === AddressType.Metamask
          && wallet.isMetamask
          && (
            connected === undefined
            || (
              connected
              && wallet.isConnected
            )
          )
        )
      ) {
        return conditionOk
      }
    }

    return conditionOk
  })

  return founded.length ? founded[0] : false
}

const getWallets = (options: IUniversalObj = {}) => {
  const { withInternal, withoutExternal } = options

  const onlyEvmWallets = (config?.opts?.ui?.disableInternalWallet) ? true : false

  const {
    user: {
      btcData,
      ghostData,
      nextData,
      btcMultisigSMSData,
      btcMultisigUserData,
      btcMultisigPinData,
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
      phi_v1Data,
      phiData,
      fkwData,
      phpxData,
      ameData,
      tokensData,
      metamaskData,
    },
  } = getState()

  const metamaskConnected = metamask.isEnabled() && metamask.isConnected()
  // if enabledCurrencies equals FALSE then all currencies is enabled
  const enabledCurrencies = config.opts.curEnabled

  if (onlyEvmWallets && !metamaskConnected) return []

  const tokenWallets = Object.keys(tokensData).map((k) => {
    const { coin, blockchain } = getCoinInfo(k)

    if (!(coin && blockchain !== ``)) return false
    if (!(!enabledCurrencies || enabledCurrencies[blockchain.toLowerCase()])) return false
    if (metamaskConnected) {
      return (
        coin && blockchain !== `` &&
          (metamaskData?.networkVersion === config.evmNetworks[blockchain].networkVersion) ?
            tokensData[k] : false
          )
    }
    return (coin && blockchain !== ``) ? tokensData[k] : false
  }).filter((d) => d !== false && d.currency !== undefined)

  const allData = [
    ...(
      !enabledCurrencies
      || enabledCurrencies.eth
      || enabledCurrencies.bnb
      || enabledCurrencies.matic
      || enabledCurrencies.arbeth
      || enabledCurrencies.xdai
      || enabledCurrencies.ftm
      || enabledCurrencies.avax
      || enabledCurrencies.movr
      || enabledCurrencies.one
      || enabledCurrencies.phi_v1
      || enabledCurrencies.phi
      || enabledCurrencies.fkw
      || enabledCurrencies.phpx
      || enabledCurrencies.ame
        ? metamaskData
          ? [metamaskData]
          : []
        : []
    ),
    ...((!enabledCurrencies || enabledCurrencies.btc) && !onlyEvmWallets
      ? [btcData, btcMultisigSMSData, btcMultisigUserData]
      : []
    ),
    ...((!enabledCurrencies || enabledCurrencies.btc) && !onlyEvmWallets
      ? btcMultisigPinData && btcMultisigPinData.isRegistered
        ? [btcMultisigPinData]
        : []
      : []),
    // =====================================
    ...((!enabledCurrencies || enabledCurrencies.btc) && !onlyEvmWallets
      ? btcMultisigUserData && btcMultisigUserData.wallets
        ? btcMultisigUserData.wallets
        : []
      : []),
    // =====================================
    ...(!enabledCurrencies || enabledCurrencies.eth
      ? metamaskConnected
        ? withInternal
          ? [ethData]
          : []
        : [ethData]
      : []),
    // =====================================
    ...(!enabledCurrencies || enabledCurrencies.bnb
      ? metamaskConnected
        ? withInternal
          ? [bnbData]
          : []
        : [bnbData]
      : []),
    // =====================================
    ...(!enabledCurrencies || enabledCurrencies.matic
      ? metamaskConnected
        ? withInternal
          ? [maticData]
          : []
        : [maticData]
      : []),
    // =====================================
    ...(!enabledCurrencies || enabledCurrencies.arbeth
      ? metamaskConnected
        ? withInternal
          ? [arbethData]
          : []
        : [arbethData]
      : []),
    // =====================================
    ...(!enabledCurrencies || enabledCurrencies.xdai
      ? metamaskConnected
        ? withInternal
          ? [xdaiData]
          : []
        : [xdaiData]
      : []),
    // =====================================
    ...(!enabledCurrencies || enabledCurrencies.ftm
      ? metamaskConnected
        ? withInternal
          ? [ftmData]
          : []
        : [ftmData]
      : []),
    // =====================================
    ...(!enabledCurrencies || enabledCurrencies.avax
      ? metamaskConnected
        ? withInternal
          ? [avaxData]
          : []
        : [avaxData]
      : []),
    // =====================================
    ...(!enabledCurrencies || enabledCurrencies.movr
      ? metamaskConnected
        ? withInternal
          ? [movrData]
          : []
        : [movrData]
      : []),
    // =====================================
    ...(!enabledCurrencies || enabledCurrencies.one
      ? metamaskConnected
        ? withInternal
          ? [oneData]
          : []
        : [oneData]
      : []),
    // =====================================
    ...(!enabledCurrencies || enabledCurrencies.aureth
      ? metamaskConnected
        ? withInternal
          ? [aurethData]
          : []
        : [aurethData]
      : []),
    // =====================================
    ...(!enabledCurrencies || enabledCurrencies.phi_v1
      ? metamaskConnected
        ? withInternal
          ? [phi_v1Data]
          : []
        : [phi_v1Data]
      : []),
    // =====================================
    ...(!enabledCurrencies || enabledCurrencies.phi
      ? metamaskConnected
        ? withInternal
          ? [phiData]
          : []
        : [phiData]
      : []),
    // =====================================
    ...(!enabledCurrencies || enabledCurrencies.fkw
      ? metamaskConnected
        ? withInternal
          ? [fkwData]
          : []
        : [fkwData]
      : []),
    // =====================================
    ...(!enabledCurrencies || enabledCurrencies.phpx
      ? metamaskConnected
        ? withInternal
          ? [phpxData]
          : []
        : [phpxData]
      : []),
    // =====================================
    ...(!enabledCurrencies || enabledCurrencies.ame
      ? metamaskConnected
        ? withInternal
          ? [ameData]
          : []
        : [ameData]
      : []),
    // =====================================
    ...((!enabledCurrencies || enabledCurrencies.ghost) && !onlyEvmWallets ? [ghostData] : []),
    ...((!enabledCurrencies || enabledCurrencies.next) && !onlyEvmWallets ? [nextData] : []),
    ...tokenWallets,
  ].map(({ account, keyPair, ...data }) => ({
    ...data,
  }))

  const data = allData.filter((item) => item?.address && item?.currency && withoutExternal ? !item.isMetamask : true)

  return (config && config.isWidget) ? sortWallets(data) : data
}

const sortWallets = (wallets) => {
  const sortedWallets: any[] = []

  if (window?.widgetEvmLikeTokens?.length) {
    const reverseTokens = window.widgetEvmLikeTokens.reverse()
    let connectExternal = false
    const connectedExternalWallets: any[] = []
    wallets.forEach((walletData) => {
      const {
        isConnected,
        isMetamask,
        isToken,
      } = walletData
      let isFounded = false
      if (!isConnected && isMetamask) {
        connectExternal = walletData
      } else {
        if (isConnected && isMetamask && !isToken) {
          connectedExternalWallets.push(walletData)
        } else {
          reverseTokens.forEach((token) => {
            const name = token.name.toLowerCase()
            const standard = token.standard.toLowerCase()
            const baseCurrency = TOKEN_STANDARDS[standard].currency.toUpperCase()
            if (walletData.name === name && walletData.standard === standard) {
              isFounded = true
            }
          })
          if (isFounded) {
            sortedWallets.unshift(walletData)
          } else {
            sortedWallets.push(walletData)
          }
        }
      }
    })
    if (connectExternal) sortedWallets.unshift(connectExternal)
    connectedExternalWallets.reverse().forEach((walletData) => { sortedWallets.unshift(walletData) })
    return sortedWallets
  }

  return wallets
}

window.getWallets = getWallets
window.getWallet = getWallet


const fetchWalletBalance = async (walletData): Promise<number> => {
  const name = helpers.getCurrencyKey(walletData.currency.toLowerCase(), true)

  try {
    if (walletData.isToken) {
      const standard = walletData.standard
      const balance = await actions[standard].fetchBalance(
        walletData.address,
        walletData.contractAddress,
        walletData.decimals
      )

      return new BigNumber(balance).toNumber()
    } else {
      if (typeof actions[name]?.fetchBalance) {
        const balance = await actions[name].fetchBalance(walletData.address)

        return new BigNumber(balance).toNumber()
      } else {
        console.warn(`Fail fetch balance for wallet '${name}' - not fetchBalance in actions`)
      }
    }
  } catch (error) {
    console.error(`Fail fetch balance for '${name.toUpperCase()}'`, error)
  }
  return 0
}

const rememberSwap = (swap) => {
  //@ts-ignore: strictNullChecks
  let swapsIds = JSON.parse(localStorage.getItem('swapId'))

  if (swapsIds === null || swapsIds.length === 0) {
      swapsIds = []
  }
  if (!swapsIds.includes(swap.id)) {
    swapsIds.push(swap.id)
  }
  localStorage.setItem('swapId', JSON.stringify(swapsIds))
}


export default {
  rememberOrder,
  forgetOrders,
  getSwapById,
  getOrders,
  setFilter,
  createOrder,
  getSwapHistory,
  updateCore,
  sendRequest,
  sendRequestForPartial,
  acceptRequest,
  declineRequest,
  removeOrder,
  markCoinAsHidden,
  markCoinAsVisible,
  requestToPeer,
  getInformationAboutSwap,
  saveDeletedOrder,
  hideMyOrders,
  showMyOrders,
  hasHiddenOrders,
  setupPartialOrder,
  initPartialOrders,
  deletedPartialCurrency,
  addCurrencyFromOrders,
  getWallets,
  getWallet,
  getHiddenCoins,
  fetchWalletBalance,
  rememberSwap,
}
