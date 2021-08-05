import { BigNumber } from 'bignumber.js'
import TokenApi from 'human-standard-token-abi'
import moment from 'moment'
import {
  LimitOrderBuilder,
  LimitOrderProtocolFacade,
  Web3ProviderConnector,
  PrivateKeyProviderConnector,
  LimitOrderPredicateBuilder,
  LimitOrderPredicateCallData,
} from '@1inch/limit-order-protocol'
import { COIN_MODEL, COIN_DATA } from 'swap.app/constants/COINS'
import getCoinInfo from 'common/coins/getCoinInfo'
import utils from 'common/utils'
import { apiLooper, externalConfig, metamask } from 'helpers'
import { getState } from 'redux/core'
import actions from 'redux/actions'
import reducers from 'redux/core/reducers'

const serviceIsAvailable = async (params) => {
  const { chainId } = params

  try {
    const res: any = await apiLooper.get('oneinch', `/${chainId}/healthcheck`)

    return res?.status === 'OK'
  } catch (error) {
    console.group('%c 1inch service', 'color: red')
    console.log(error)
    console.groupEnd()

    return false
  }
}

const fetchTokensByChain = async (params) => {
  const { chainId } = params

  try {
    const data: any = await apiLooper.get('oneinch', `/${chainId}/tokens`)

    return data.tokens
  } catch (error) {
    console.group('%c 1inch tokens', 'color: red')
    console.log(error)
    console.groupEnd()

    return {}
  }
}

const addTokens = (params) => {
  const { chainId, tokens } = params

  reducers.oneinch.addTokens({
    chainId,
    tokens,
  })
}

const fetchAllTokens = () => {
  const availableChains = [1, 56, 137] // [ETH, BSC, Polygon] (Mainnet ID)

  Object.keys(externalConfig.evmNetworks).forEach(async (nativeCurrency) => {
    const chainInfo = externalConfig.evmNetworks[nativeCurrency]

    if (availableChains.includes(chainInfo.networkVersion)) {
      const tokens: any = await fetchTokensByChain({ chainId: chainInfo.networkVersion })

      addTokens({
        chainId: chainInfo.networkVersion,
        tokens: tokens,
      })
    }
  })
}

const filterCurrencies = (params) => {
  const { currencies, tokensWallets, oneinchTokens, onlyTokens = false } = params

  return currencies.filter((item) => {
    const currency = COIN_DATA[item.name]
    let isCurrencySuitable = false

    // it's token. Check it in the 1inch matched token list
    if (item.standard) {
      const { blockchain } = getCoinInfo(item.value)

      const networkVersion = externalConfig.evmNetworks[blockchain].networkVersion
      const walletKey = item.value.toLowerCase()
      const tokensByChain = oneinchTokens[networkVersion]

      isCurrencySuitable =
        // if token is in the object then it's true
        tokensByChain && !!tokensByChain[tokensWallets[walletKey].contractAddress]
    } else {
      isCurrencySuitable = currency?.model === COIN_MODEL.AB && !onlyTokens
    }
    // connected metamask allows only one chain
    const suitableForNetwork = metamask.isConnected()
      ? metamask.isAvailableNetworkByCurrency(item.value)
      : true

    return isCurrencySuitable && suitableForNetwork
  })
}

const fetchSpenderContractAddress = async (params): Promise<string | false> => {
  const { chainId } = params

  try {
    const data: any = await apiLooper.get('oneinch', `/${chainId}/approve/spender`)

    return data.address
  } catch (error) {
    console.group('%c 1inch spender address', 'color: red')
    console.log(error)
    console.groupEnd()

    return false
  }
}

const fetchTokenAllowance = async (params): Promise<number> => {
  const { chainId, standard, owner, contract, decimals } = params
  const Web3 = actions[standard].getCurrentWeb3()
  const tokenContract = new Web3.eth.Contract(TokenApi, contract, {
    from: owner,
  })
  let allowance = 0

  try {
    const spenderContract = await fetchSpenderContractAddress({ chainId })

    allowance = await tokenContract.methods.allowance(owner, spenderContract).call({ from: owner })

    // formatting without token decimals
    allowance = new BigNumber(allowance)
      .dp(0, BigNumber.ROUND_UP)
      .div(10 ** decimals)
      .toNumber()
  } catch (error) {
    console.group('%c 1inch token allowance', 'color: red')
    console.log(error)
    console.groupEnd()
  }

  return allowance
}

const approveToken = async (params) => {
  const { chainId, amount, contract } = params

  const request = ''.concat(
    `/${chainId}/approve/calldata?`,
    `amount=${amount}&`,
    `tokenAddress=${contract}&`
  )

  try {
    const approveData = await apiLooper.get('oneinch', request)

    return approveData
  } catch (error) {
    console.group('%c 1inch token approve', 'color: red')
    console.log(error)
    console.groupEnd()

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
    // a limit order is valid only for 1 minute
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
      console.group('%c 1inch send limit order', 'color: red')
      console.log(error)
      console.groupEnd()
      return true
    },
  })
}

/* const createRFQOrder = async (params) => {
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
    expirationTimeInMinutes,
  } = params

  const contractAddress = externalConfig.limitOrder[baseCurrency]
  const connector = getWeb3Connector(baseCurrency, makerAddress)
  const builder = new LimitOrderBuilder(contractAddress, chainId, connector)
  const protocolFacade = new LimitOrderProtocolFacade(contractAddress, connector)

  const makerUnitAmount = utils.amount.formatWithDecimals(makerAmount, makerAssetDecimals)
  const takerUnitAmount = utils.amount.formatWithDecimals(takerAmount, takerAssetDecimals)

  const timeStamp = new BigNumber(utils.getUnixTimeStamp())
  const SEC_IN_MIN = 60
  const expiresInTimestamp = timeStamp
    .plus(new BigNumber(expirationTimeInMinutes).times(SEC_IN_MIN))
    .toNumber()

  const RFQOrder = builder.buildRFQOrder({
    id: 4, // TODO: fetch all user's orders and pass their quantity plus 1 as an ID
    expiresInTimestamp,
    makerAssetAddress,
    takerAssetAddress,
    makerAddress,
    makerAmount: makerUnitAmount,
    takerAmount: takerUnitAmount,
  })
  const orderTypedData = builder.buildRFQOrderTypedData(RFQOrder)
  const signature = await builder.buildOrderSignature(makerAddress, orderTypedData)
  const callData = protocolFacade.fillRFQOrder(
    RFQOrder,
    signature,
    makerUnitAmount,
    // one of the assets (it doesn't matter which one) must be zero
    // why? who knows
    '0'
  )

  return await actions[baseCurrency].send({
    to: contractAddress,
    data: callData,
    amount: 0,
    waitReceipt: true,
  })
} */

const cancelLimitOrder = async (params) => {
  const { baseCurrency, orderData } = params
  const { user } = getState()
  const owner = metamask.isConnected() ? metamask.getAddress() : user[`${baseCurrency}Data`].address
  const contractAddress = externalConfig.limitOrder[baseCurrency]
  const connector = getWeb3Connector(baseCurrency, owner)
  const protocolFacade = new LimitOrderProtocolFacade(contractAddress, connector)
  const callData = protocolFacade.cancelLimitOrder(orderData)

  return await actions[baseCurrency].send({
    to: contractAddress,
    data: callData,
    amount: 0,
  })
}

const fetchLatestLimitOrder = async (params) => {
  const { chainId, owner } = params
  const { oneinch } = getState()

  try {
    const orders: any = await apiLooper.get(
      'limitOrders',
      `/${chainId}/limit-order/address/${owner}?limit=1&sortBy=createDateTime`
    )

    const penultimateOrder = oneinch.orders[chainId][0]

    // let's compare the last known order with new one
    // to be sure that we fetched a really new order
    if (penultimateOrder.signature.toLowerCase() !== orders[0].signature.toLowerCase()) {
      reducers.oneinch.addOrder({ chainId, order: orders[0] })
    }
  } catch (error) {
    console.group('%c 1inch fetch latest order', 'color: red')
    console.log(error)
    console.groupEnd()
  }
}

const fetchLimitOrders = async (params) => {
  const { chainId, owner } = params

  try {
    const orders = await apiLooper.get(
      'limitOrders',
      `/${chainId}/limit-order/address/${owner}?sortBy=createDateTime`
    )

    reducers.oneinch.addOrders({ chainId, orders })
  } catch (error) {
    console.group('%c 1inch fetch limit order', 'color: red')
    console.log(error)
    console.groupEnd()
  }
}

const fetchUserOrders = async () => {
  const { user, oneinch } = getState()

  Object.keys(oneinch.blockchains).forEach(async (chainId) => {
    const currency = oneinch.blockchains[chainId].baseCurrency.toLowerCase()
    const owner = metamask.isConnected() ? metamask.getAddress() : user[`${currency}Data`].address

    await fetchLimitOrders({ chainId, owner })
  })
}

/* const fetchAllLimitOrders = async (params) => {
  const { chainId } = params

  try {
    return await apiLooper.get('limitOrders', `/${chainId}/limit-order/all`)
  } catch (error) {
    console.group('%c 1inch fetch limit order', 'color: red')
    console.log(error)
    console.groupEnd()

    return []
  }
} */

export default {
  serviceIsAvailable,
  fetchTokensByChain,
  fetchAllTokens,
  filterCurrencies,
  addTokens,
  fetchSpenderContractAddress,
  fetchTokenAllowance,
  approveToken,
  createLimitOrder,
  //createRFQOrder,
  cancelLimitOrder,
  fetchLatestLimitOrder,
  fetchLimitOrders,
  fetchUserOrders,
  //fetchAllLimitOrders,
}
