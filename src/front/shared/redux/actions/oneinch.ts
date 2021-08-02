import { BigNumber } from 'bignumber.js'
import TokenApi from 'human-standard-token-abi'
import { LimitOrderBuilder, LimitOrderProtocolFacade } from '@1inch/limit-order-protocol'
import { apiLooper, externalConfig } from 'helpers'
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

const createLimitOrder = async (params) => {
  const {
    chainId,
    baseCurrency,
    makerAddress,
    makerAssetAddress,
    takerAssetAddress,
    makerAmount,
    takerAmount,
  } = params

  const contractAddress = '0x5fa31604fc5dcebfcac2481f9fa59d174126e5e6'
  const web3 = actions[baseCurrency].getCurrentWeb3()

  const limitOrderBuilder = new LimitOrderBuilder(contractAddress, chainId, web3)
  const limitOrderProtocolFacade = new LimitOrderProtocolFacade(contractAddress, web3)

  const order = limitOrderBuilder.buildLimitOrder({
    makerAddress,
    makerAssetAddress,
    takerAssetAddress,
    makerAmount, // FIXME: at first need to convert with token decimals
    takerAmount, // FIXME: at first need to convert with token decimals
    // predicate: '0x0',
    // permit: '0x0',
    // interaction: '0x0',
  })
  const limitOrderTypedData = limitOrderBuilder.buildLimitOrderTypedData(order)
  const signature = await limitOrderBuilder.buildOrderSignature(makerAddress, limitOrderTypedData)

  // Create a call data for fill the limit order
  const callData = limitOrderProtocolFacade.fillLimitOrder(
    order,
    signature,
    makerAmount,
    '0',
    new BigNumber(makerAmount).div(2).dp(0, BigNumber.ROUND_HALF_EVEN).toString()
  )

  return await actions[baseCurrency].send({
    to: contractAddress,
    data: callData,
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
  addTokens,
  fetchSpenderContractAddress,
  fetchTokenAllowance,
  approveToken,
  createLimitOrder,
  fetchLimitOrder,
  fetchAllLimitOrders,
}
