import reducers from 'redux/core/reducers'
import actions from 'redux/actions'
import { getState } from 'redux/core'
import SwapApp from 'swap.app'
import Swap from 'swap.swap'
import { constants } from 'helpers'
import Pair from 'pages/Exchange/Orders/Pair'
import config from 'helpers/externalConfig'
import { BigNumber } from 'bignumber.js'

import metamask from 'helpers/metamask'
import { AddressType } from 'domain/address'

import helpers from 'helpers'

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
  switch (currency.toUpperCase()) {
    case 'BTC':
      return getState().user.btcData

    case 'ETH':
      return getState().user.ethData

    case 'GHOST':
      return getState().user.ghostData

    case 'NEXT':
      return getState().user.nextData

    default:
      return {}
  }
}

const setFilter = (filter) => {
  reducers.core.setFilter({ filter })
}

const acceptRequest = (orderId, participantPeer) => {
  const order = SwapApp.shared().services.orders.getByKey(orderId)
  order.acceptRequest(participantPeer)
}

const declineRequest = (orderId, participantPeer) => {
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
  SwapApp.shared().services.orders.remove(orderId)
  actions.core.updateCore()
}

const showMyOrders = () => {
  SwapApp.shared().services.orders.showMyOrders()
}

const hideMyOrders = () => {
  SwapApp.shared().services.orders.hideMyOrders()
}

const deletedPartialCurrency = (orderId) => {
  const deletedOrder = SwapApp.shared().services.orders.getByKey(orderId)
  const deletedOrderSellCurrency = deletedOrder.sellCurrency
  const deletedOrderBuyCurrency = deletedOrder.buyCurrency
  const orders = SwapApp.shared().services.orders.items

  const deletedOrderSell = orders.filter(
    (item) => item.sellCurrency.toUpperCase() === deletedOrderSellCurrency
  )
  const deletedOrderBuy = orders.filter(
    (item) => item.buyCurrency.toUpperCase() === deletedOrderBuyCurrency
  )

  const premiumCurrencies = ['BTC', 'ETH', 'GHOST', 'NEXT', 'SWAP'] // валюты, которые всегда должны быть в дропе

  if (deletedOrderSell.length === 1 && !premiumCurrencies.includes(deletedOrderSellCurrency)) {
    reducers.currencies.deletedPartialCurrency(deletedOrderSellCurrency)
  } else if (deletedOrderBuy.length === 1 && !premiumCurrencies.includes(deletedOrderBuyCurrency)) {
    reducers.currencies.deletedPartialCurrency(deletedOrderBuyCurrency)
  }
}

const hasHiddenOrders = () => SwapApp.shared().services.orders.hasHiddenOrders()

const sendRequest = (orderId, destination = {}, callback) => {
  //@ts-ignore
  const { address: destinationAddress } = destination

  const order = SwapApp.shared().services.orders.getByKey(orderId)

  const userCurrencyData = getUserData(order.buyCurrency)
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

  const order = SwapApp.shared().services.orders.getByKey(orderId)

  //console.log('>>> core:sendRequestForPartial order =', order)

  const { address, reputation, reputationProof } = getUserData(order.buyCurrency)

  const requestOptions = {
    address: destinationAddress,
    participantMetadata: {
      address,
      reputation,
      reputationProof,
    },
  }

  //console.log('>>> core:sendRequestForPartial requestOptions =', requestOptions)

  order.sendRequestForPartial(
    newValues,
    requestOptions,
    (newOrder, isAccepted) => {
      console.log('newOrder', newOrder)
      console.log('isAccepted', isAccepted)

      callback(newOrder, isAccepted)
    },
    (oldOrder, newOrder) => {
      const oldPrice = Pair.fromOrder(oldOrder).price
      const newPrice = Pair.fromOrder(newOrder).price

      console.log('prices', oldPrice.toString(), newPrice.toString())
      // | new - old | / old < 5%
      return newPrice.minus(oldPrice).abs().div(oldPrice).isLessThanOrEqualTo(0.05)
    }
  )
}

const createOrder = (data, isPartial = false) => {
  const order = SwapApp.shared().services.orders.create(data)
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

    const sellAmount = oldPair.isBid() ? buyAmount.times(price) : buyAmount.div(price)

    debug('newSellAmount', sellAmount)

    const newOrder = { sellAmount, buyAmount }
    debug('newOrder', newOrder)

    return newOrder
  })
}

const initPartialOrders = () => {
  SwapApp.shared().services.orders.items.forEach((order) => {
    if (order && order.isMy && order.isPartial) {
      actions.core.setupPartialOrder(order)
    }
  })
}

const requestToPeer = (event, peer, data, callback) => {
  SwapApp.shared().services.orders.requestToPeer(event, peer, data, callback)
}

const updateCore = () => {
  SwapApp.onInit(() => {
    const orders = SwapApp.shared().services.orders.items

    getOrders(orders)

    actions.feed.getFeedDataFromOrder(orders)
  })
}

const getSwapHistory = () => {
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
      ...SwapApp.shared().env.storage.getItem(`swap.${swapId}`),
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

  const findedCoin = JSON.parse(localStorage.getItem(hiddenCoinsList)).find(
    (el) => el.includes(coin) && el.includes(':')
  )

  reducers.core.markCoinAsVisible(findedCoin || coin)
  localStorage.setItem(hiddenCoinsList, JSON.stringify(getState().core.hiddenCoinsList))

  if (doBackup) {
    actions.backupManager.serverBackup()
  }
}

interface I_getWallet_FindCondition {
  currency?: string
  address?: string
  addressType?: string
}
const getWallet = (findCondition: I_getWallet_FindCondition) => {
  // specify addressType,
  // otherwise it finds the first wallet from all origins, including metamask
  const { currency, address, addressType } = findCondition

  const wallets = getWallets({ withInternal: true })
  const founded = wallets.filter((wallet) => {
    if (wallet.isMetamask && !wallet.isConnected) return false
    const conditionOk = currency && wallet.currency.toLowerCase() === currency.toLowerCase()

    if (address) {
      if (wallet.address.toLowerCase() === address.toLowerCase()) {
        return conditionOk
      }
    }

    if (addressType) {
      if (
        (addressType === AddressType.Internal && !wallet.isMetamask) ||
        (addressType === AddressType.Metamask && wallet.isMetamask)
      ) {
        return conditionOk
      }
    }

    return conditionOk
  })

  return founded.length ? founded[0] : false
}

const getWallets = (options) => {
  const { withInternal } = options

  const {
    user: {
      btcData,
      ghostData,
      nextData,
      btcMultisigSMSData,
      btcMultisigUserData,
      btcMultisigPinData,
      ethData,
      tokensData,
      isTokenSigned,

      metamaskData,
    },
  } = getState()

  // Sweep
  const {
    user: { btcMnemonicData, ethMnemonicData, ghostMnemonicData, nextMnemonicData },
  } = getState()

  const metamaskConnected = metamask.isEnabled() && metamask.isConnected()

  const allData = [
    ...(!config.opts.curEnabled || config.opts.curEnabled.eth
      ? metamaskData
        ? [metamaskData]
        : []
      : []),
    ...(!config.opts.curEnabled || config.opts.curEnabled.btc
      ? btcMnemonicData && !btcData.isMnemonic
        ? [btcMnemonicData]
        : []
      : []), // Sweep
    ...(!config.opts.curEnabled || config.opts.curEnabled.eth
      ? ethMnemonicData && !ethData.isMnemonic
        ? [ethMnemonicData]
        : []
      : []), // Sweep
    ...(!config.opts.curEnabled || config.opts.curEnabled.btc ? [btcData] : []),
    ...(!config.opts.curEnabled || config.opts.curEnabled.btc ? [btcMultisigSMSData] : []),
    ...(!config.opts.curEnabled || config.opts.curEnabled.btc
      ? btcMultisigPinData && btcMultisigPinData.isRegistered
        ? [btcMultisigPinData]
        : []
      : []),
    ...(!config.opts.curEnabled || config.opts.curEnabled.btc ? [btcMultisigUserData] : []),
    ...(!config.opts.curEnabled || config.opts.curEnabled.btc
      ? btcMultisigUserData && btcMultisigUserData.wallets
        ? btcMultisigUserData.wallets
        : []
      : []),
    ...(!config.opts.curEnabled || config.opts.curEnabled.eth
      ? metamaskConnected
        ? withInternal
          ? [ethData]
          : []
        : [ethData]
      : []),
    ...(!config.opts.curEnabled || config.opts.curEnabled.ghost ? [ghostData] : []),
    ...(!config.opts.curEnabled || config.opts.curEnabled.next ? [nextData] : []),
    ...Object.keys(tokensData)
      .filter((k) => !tokensData[k].reducerDataTarget)
      .map((k) => tokensData[k]),
  ].map(({ account, keyPair, ...data }) => ({
    ...data,
  }))

  return allData.filter((item) => item && item.address)
}

const fetchWalletBalance = async (walletData) => {
  const name = walletData.currency.toLowerCase()
  if (helpers.ethToken.isEthToken({ name })) {
    try {
      const balance = await actions.token.fetchBalance(
        walletData.address,
        walletData.contractAddress,
        walletData.decimals
      )
      return new BigNumber(balance).toNumber()
    } catch (err) {
      console.error(`Fail fetch balance for wallet '${name}'`, err)
    }
  } else {
    if (
      actions[name] &&
      actions[name].fetchBalance &&
      typeof actions[name].fetchBalance === `function`
    ) {
      try {
        const balance = await actions[name].fetchBalance(walletData.address)
        return balance
      } catch (err) {
        console.error(`Fail fetch balance for wallet '${name}'`, err)
      }
    } else {
      console.warn(`Fail fetch balance for wallet '${name}' - not fetchBalance in actions`)
    }
  }
  return 0
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
}
