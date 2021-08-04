import { BigNumber } from 'bignumber.js'
import TokenApi from 'human-standard-token-abi'
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

  reducers.currencies.add1inchTokens({
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

  const { or, and, timestampBelow, nonceEquals, gt, lt, eq } = predicateBuilder

  const orderPredicate: LimitOrderPredicateCallData = and(
    // a limit order is valid only for 1 minute
    timestampBelow(Math.round(Date.now() / 1000) + 60_000),
    // a limit order is valid until the nonce of makerAddress is equal to 4
    nonceEquals(makerAddress, 4)
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
    //permit: '0x', // optional
    //interaction: '0x', // optional
  })
  const orderTypedData = builder.buildLimitOrderTypedData(order)
  const orderHash = builder.buildLimitOrderHash(orderTypedData)
  const signature = await builder.buildOrderSignature(makerAddress, orderTypedData)
  /*  const callData = protocolFacade.fillLimitOrder(
    order,
    signature,
    makerUnitAmount,
    '0', // one of the assets (it doesn't matter which one) must be zero
    takerUnitAmount
  ) */

  const validOrder = await orderIsValid({
    facade: protocolFacade,
    contract: externalConfig.limitOrder[baseCurrency],
    predicate: order.predicate,
  })

  console.log('validOrder: ', validOrder)

  return sendLimitOrder({
    chainId,
    order,
    orderHash,
    makerAmount: makerUnitAmount,
    takerAmount: takerUnitAmount,
    makerAddress,
    signature,
  })

  /* return await actions[baseCurrency].send({
    to: contractAddress,
    data: callData,
    amount: 0,
    waitReceipt: true,
  }) */
}

const orderIsValid = async ({ facade, contract, predicate }) => {
  const addresses = [contract]
  const callDatas = [predicate]

  try {
    const result: boolean = await facade.simulateCalls(addresses, callDatas)

    return result
  } catch (error) {
    console.error(error)

    return false
  }
}

const sendLimitOrder = async (params) => {
  const { chainId, order, orderHash, makerAmount, takerAmount, makerAddress, signature } = params
  const milliseconds = utils.getUnixTimeStamp() * 1000
  const createDateTime = new Date(milliseconds).toLocaleString()

  return {
    // isActive: true,
    //chainId,
    createDateTime: '2021-08-04T15:26:23.247Z',
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
  }

  return await apiLooper.post('limitOrders', `/${chainId}/limit-order`, {
    body: {
      // isActive: true,
      createDateTime: '2021-08-04T15:13:57.227Z',
      //chainId,
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
      console.error('1inch limit order', error)
      return true
    },
  })
}

const createRFQOrder = async (params) => {
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
}

const fetchLimitOrder = async (params) => {
  const { chainId, owner } = params

  try {
    return await apiLooper.get('limitOrders', `/${chainId}/limit-order/address/${owner}`)
  } catch (error) {
    console.group('%c 1inch fetch limit order', 'color: red')
    console.log(error)
    console.groupEnd()

    return []
  }
}

const fetchAllLimitOrders = async (params) => {
  const { chainId } = params

  try {
    return await apiLooper.get('limitOrders', `/${chainId}/limit-order/all`)
  } catch (error) {
    console.group('%c 1inch fetch limit order', 'color: red')
    console.log(error)
    console.groupEnd()

    return []
  }
}

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
  createRFQOrder,
  fetchLimitOrder,
  fetchAllLimitOrders,
}
