import { BigNumber } from 'bignumber.js'
import moment from 'moment'
import {
  LimitOrderBuilder,
  LimitOrderProtocolFacade,
  Web3ProviderConnector,
  PrivateKeyProviderConnector,
  LimitOrderPredicateBuilder,
  LimitOrderPredicateCallData,
} from '@1inch/limit-order-protocol'
import utils from 'common/utils'
import erc20Like from 'common/erc20Like'
import { apiLooper, externalConfig, metamask, feedback, quickswap } from 'helpers'
import { getState } from 'redux/core'
import actions from 'redux/actions'
import reducers from 'redux/core/reducers'

const reportError = (part, error) => {
  feedback.actions.failed(`1inch - part: ${part}, error message - ${error.message}`)

  console.group('%c 1inch', 'color: red')
  console.log(error)
  console.groupEnd()
}

const filterCurrencies = (params) => {
  const { currencies: activeCurrencies } = quickswap.filterCurrencies(params)
  const { oneinch } = getState()
  const oneinchChainIds = Object.keys(oneinch.blockchains).map(Number)

  return {
    currencies: activeCurrencies.filter(({ blockchain }) => {
      const chainId = externalConfig.evmNetworks[blockchain]

      return !!oneinch.blockchains[chainId]
    }),
    wrongNetwork: quickswap.isWrongNetwork(oneinchChainIds),
  }
}

const fetchSpenderContractAddress = async (params): Promise<string | false> => {
  const { chainId } = params

  try {
    const data: any = await apiLooper.get('oneinch', `/${chainId}/approve/spender`)

    return data.address
  } catch (error) {
    reportError('spender contract fetching', error)

    return false
  }
}

const getWeb3Connector = (baseCurrency, owner) => {
  let web3 = metamask.getWeb3()
  let connector

  if (!web3) {
    const privateKey = actions[baseCurrency].getPrivateKeyByAddress(owner)

    web3 = actions[baseCurrency].getCurrentWeb3()
    connector = new PrivateKeyProviderConnector(privateKey.replace('0x', ''), web3)
  } else {
    connector = new Web3ProviderConnector(web3)
  }

  return connector
}

const createLimitOrder = async (params) => {
  const {
    chainId,
    baseCurrency,
    makerAddress,
    makerAssetAddress,
    makerAssetDecimals,
    takerAssetAddress,
    takerAssetDecimals,
    makerAmount,
    takerAmount,
  } = params

  const contractAddress = externalConfig.limitOrder[baseCurrency]
  const connector = getWeb3Connector(baseCurrency, makerAddress)
  const builder = new LimitOrderBuilder(contractAddress, chainId, connector)
  const protocolFacade = new LimitOrderProtocolFacade(contractAddress, connector)
  const predicateBuilder = new LimitOrderPredicateBuilder(protocolFacade)

  const { and, timestampBelow, nonceEquals } = predicateBuilder

  const makerNonce = await protocolFacade.nonce(contractAddress)

  const orderPredicate: LimitOrderPredicateCallData = and(
    // a created, but not approved limit order is valid only for 1 minute
    timestampBelow(utils.getUnixTimeStamp() + 60_000),
    nonceEquals(makerAddress, makerNonce)
  )

  const makerUnitAmount = utils.amount.formatWithDecimals(makerAmount, makerAssetDecimals)
  const takerUnitAmount = utils.amount.formatWithDecimals(takerAmount, takerAssetDecimals)

  const order = builder.buildLimitOrder({
    makerAssetAddress,
    takerAssetAddress,
    makerAddress,
    makerAmount: makerUnitAmount,
    takerAmount: takerUnitAmount,
    predicate: orderPredicate,
  })

  const orderTypedData = builder.buildLimitOrderTypedData(order)
  const orderHash = builder.buildLimitOrderHash(orderTypedData)
  const signature = await builder.buildOrderSignature(makerAddress, orderTypedData)

  return sendLimitOrder({
    chainId,
    order,
    orderHash,
    makerAmount: makerUnitAmount,
    takerAmount: takerUnitAmount,
    makerAddress,
    signature,
  })
}

const sendLimitOrder = async (params) => {
  const { chainId, order, orderHash, makerAmount, takerAmount, makerAddress, signature } = params
  const createDateTime = moment().toISOString()

  return await apiLooper.post('limitOrders', `/${chainId}/limit-order`, {
    body: {
      createDateTime,
      data: {
        getMakerAmount: order.getMakerAmount,
        getTakerAmount: order.getTakerAmount,
        interaction: order.interaction,
        makerAsset: order.makerAsset,
        makerAssetData: order.makerAssetData,
        permit: order.permit,
        predicate: order.predicate,
        salt: order.salt,
        takerAsset: order.takerAsset,
        takerAssetData: order.takerAssetData,
      },
      orderHash,
      makerAmount,
      takerAmount,
      orderMaker: makerAddress,
      remainingMakerAmount: makerAmount,
      signature,
    },
    reportErrors: (error) => {
      reportError('send a limit order', error)

      return true
    },
  })
}

const fillLimitOrder = async (params) => {
  const { order, name, baseCurrency, standard, takerDecimals, amountToBeFilled } = params
  const { user } = getState()

  const owner = metamask.isConnected() ? metamask.getAddress() : user[`${baseCurrency}Data`].address
  const protocolContract = externalConfig.limitOrder[baseCurrency]

  const allowance = await erc20Like[standard].checkAllowance({
    spender: protocolContract,
    contract: order.data.takerAsset,
    decimals: takerDecimals,
    owner,
  })

  if (new BigNumber(allowance).isLessThan(amountToBeFilled)) {
    await actions[standard].approve({
      name,
      to: protocolContract,
      amount: amountToBeFilled,
    })
  }

  const connector = getWeb3Connector(baseCurrency, owner)
  const limitOrderProtocolFacade = new LimitOrderProtocolFacade(protocolContract, connector)
  const weiTakerAmount = utils.amount.formatWithDecimals(amountToBeFilled, takerDecimals)

  // fillLimitOrder(order, signature, makerAmount, takerAmount, thresholdAmount)
  // * one of the amounts has to be 0
  const callData = limitOrderProtocolFacade.fillLimitOrder(
    order.data,
    order.signature,
    '0',
    weiTakerAmount,
    weiTakerAmount
  )
  // custom value. Maybe we can find exact gas limit
  const gasLimit = 150_000

  try {
    const receipt = await actions[baseCurrency].send({
      to: protocolContract,
      data: callData,
      amount: 0,
      gasLimit,
      waitReceipt: true,
    })

    return receipt
  } catch (error) {
    reportError('fill a limit order', error)

    return false
  }
}

const cancelLimitOrder = async (params) => {
  const { chainId, baseCurrency, orderData, orderIndex } = params
  const { user } = getState()

  const owner = metamask.isConnected() ? metamask.getAddress() : user[`${baseCurrency}Data`].address

  const contractAddress = externalConfig.limitOrder[baseCurrency]
  const connector = getWeb3Connector(baseCurrency, owner)
  const protocolFacade = new LimitOrderProtocolFacade(contractAddress, connector)
  const callData = protocolFacade.cancelLimitOrder(orderData)

  try {
    const receipt = await actions[baseCurrency].send({
      waitReceipt: true,
      to: contractAddress,
      data: callData,
      amount: 0,
    })

    removeLimitOrderFromState({ chainId, orderIndex })

    return receipt
  } catch (error) {
    reportError('cancel a limit order', error)

    return false
  }
}

const removeLimitOrderFromState = (params) => {
  const { chainId, orderIndex } = params

  reducers.oneinch.removeOrder({ chainId, index: orderIndex })
}

const fetchLatestLimitOrder = async (params) => {
  const { chainId, owner } = params
  const { oneinch } = getState()

  try {
    const fetchedOrders: any = await apiLooper.get(
      'limitOrders',
      `/${chainId}/limit-order/address/${owner}?limit=1&sortBy=createDateTime`
    )

    const penultimateOrder = oneinch.orders[chainId][0]

    // let's compare the last known order with new one
    // to be sure that we fetched a really new order
    const newOrderFetched =
      penultimateOrder?.signature?.toLowerCase() !== fetchedOrders[0].signature.toLowerCase()

    if (newOrderFetched) {
      reducers.oneinch.addOrder({ chainId, order: fetchedOrders[0] })
    }
  } catch (error) {
    reportError('fetch a latest owner order', error)
  }
}

const fetchOwnerOrders = async (params) => {
  const { chainId, owner, page = 1, pageItems = 20, makerAsset = '', takerAsset = '' } = params

  const request = [
    `/${chainId}/limit-order/address/${owner}?`,
    `page=${page}&`,
    `limit=${pageItems}&`,
    `statuses=%5B1%5D&`, // only valid orders
    `sortBy=createDateTime`,
  ]

  if (takerAsset) request.push(`&takerAsset=${takerAsset.toLowerCase()}`)
  if (makerAsset) request.push(`&makerAsset=${makerAsset.toLowerCase()}`)

  try {
    const orders = await apiLooper.get('limitOrders', request.join(''))

    return orders
  } catch (error) {
    reportError('fetch an owner limit order', error)

    return []
  }
}

const fetchUserOrders = async () => {
  const { user, oneinch } = getState()

  Object.keys(oneinch.blockchains).forEach(async (chainId) => {
    const currency = oneinch.blockchains[chainId].currency.toLowerCase()
    const owner = metamask.isConnected() ? metamask.getAddress() : user[`${currency}Data`].address
    const orders = await fetchOwnerOrders({ chainId, owner })

    reducers.oneinch.addOrders({ chainId, orders })
  })
}

const fetchAllOrders = async (params) => {
  const { chainId, page = 1, pageItems = 30, takerAsset = '', makerAsset = '' } = params

  const request = [
    `/${chainId}/limit-order/all?`,
    `page=${page}&`,
    `limit=${pageItems}&`,
    `statuses=%5B1%5D&`, // only valid orders
    `sortBy=createDateTime`,
  ]

  if (takerAsset) request.push(`&takerAsset=${takerAsset.toLowerCase()}`)
  if (makerAsset) request.push(`&makerAsset=${makerAsset.toLowerCase()}`)

  try {
    const orders = await apiLooper.get('limitOrders', request.join(''))

    return orders
  } catch (error) {
    reportError('fetch all limit orders', error)

    return []
  }
}

export default {
  filterCurrencies,
  fetchSpenderContractAddress,
  createLimitOrder,
  fillLimitOrder,
  cancelLimitOrder,
  removeLimitOrderFromState,
  fetchLatestLimitOrder,
  fetchOwnerOrders,
  fetchUserOrders,
  fetchAllOrders,
}
