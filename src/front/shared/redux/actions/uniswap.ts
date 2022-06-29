import BigNumber from 'bignumber.js'
import { abi as FactoryV2ABI } from '@uniswap/v2-periphery/build/IUniswapV2Factory.json'
import { abi as RouterV2ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import { abi as PairV2ABI } from '@uniswap/v2-periphery/build/IUniswapV2Pair.json'
import ethLikeHelper from 'common/helpers/ethLikeHelper'
import constants from 'common/helpers/constants'
import utils from 'common/utils'
import actions from 'redux/actions'

const ABIS = {
  factory: FactoryV2ABI,
  router: RouterV2ABI,
  pair: PairV2ABI,
}

enum SwapMethods {
  swapExactETHForTokens = 'swapExactETHForTokens',
  swapExactTokensForETH = 'swapExactTokensForETH',
  swapExactTokensForTokens = 'swapExactTokensForTokens',
  swapTokensForExactTokens = 'swapTokensForExactTokens',
  swapExactETHForTokensSupportingFeeOnTransferTokens = 'swapExactETHForTokensSupportingFeeOnTransferTokens',
  swapExactTokensForETHSupportingFeeOnTransferTokens = 'swapExactTokensForETHSupportingFeeOnTransferTokens',
  swapExactTokensForTokensSupportingFeeOnTransferTokens = 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
}

enum LiquidityMethods {
  addLiquidity = 'addLiquidity',
  addLiquidityETH = 'addLiquidityETH',
  removeLiquidity = 'removeLiquidity',
  removeLiquidityETH = 'removeLiquidityETH',
}

type GetContractParams = {
  name: 'factory' | 'router' | 'pair'
  address: string
  baseCurrency: string
}

const wrapCurrency = (chainId: number, currencyAddress: string) => {
  const { WrapperCurrency, EVM_COIN_ADDRESS } = constants.ADDRESSES

  return currencyAddress === EVM_COIN_ADDRESS ? WrapperCurrency[chainId] : currencyAddress
}

const getContract = (params: GetContractParams) => {
  const { name, address, baseCurrency } = params

  return ethLikeHelper[baseCurrency?.toLowerCase()]?.getContract({
    abi: ABIS[name],
    address,
  })
}

const getDeadline = async (provider, deadlinePeriod): Promise<string> => {
  const latestBlockNumber = await provider.eth.getBlockNumber()
  const latestBlock = await provider.eth.getBlock(latestBlockNumber)
  const timestamp = latestBlock.timestamp

  return utils.amount.toHexNumber(new BigNumber(timestamp).plus(deadlinePeriod))
}

const getSlippageRange = (slippagePercent, amount) => {
  const MAX_PERCENT = 100

  return new BigNumber(amount).div(MAX_PERCENT).times(slippagePercent).toNumber()
}

const getMinAmount = (amount, range) => {
  return new BigNumber(amount).minus(range).integerValue(BigNumber.ROUND_CEIL)
}

const getPairAddress = async (params) => {
  const { factoryAddress, baseCurrency, chainId } = params
  let { tokenA, tokenB } = params

  const factory = getContract({
    name: 'factory',
    address: factoryAddress,
    baseCurrency,
  })

  tokenA = wrapCurrency(chainId, tokenA)
  tokenB = wrapCurrency(chainId, tokenB)

  try {
    return await factory?.methods.getPair(tokenA, tokenB).call()
  } catch (error) {
    console.error(error)
    return false
  }
}

const getAmountOut = async (params) => {
  const {
    routerAddress,
    baseCurrency,
    chainId,
    tokenA,
    tokenADecimals,
    tokenB,
    tokenBDecimals,
    amountIn,
  } = params

  const router = getContract({ name: 'router', address: routerAddress, baseCurrency })
  const unitAmountIn = utils.amount.formatWithDecimals(amountIn, tokenADecimals)
  const path = [wrapCurrency(chainId, tokenA), wrapCurrency(chainId, tokenB)]

  try {
    // use getAmountsOut instead of getAmountOut, because we don't need
    // to request pair reserves manually for the second method arguments
    const amounts = await router?.methods
      .getAmountsOut(utils.amount.toHexNumber(unitAmountIn), path)
      .call()

    return utils.amount.formatWithoutDecimals(amounts[1], tokenBDecimals)
  } catch (error) {
    return error
  }
}

const getLiquidityAmountForAssetB = async (params) => {
  const {
    chainId,
    pairAddress,
    routerAddress,
    baseCurrency,
    amountADesired,
    tokenADecimals,
    tokenBDecimals,
  } = params
  let { tokenA } = params

  tokenA = wrapCurrency(chainId, tokenA)

  const router = getContract({ name: 'router', address: routerAddress, baseCurrency })
  const pair = getContract({ name: 'pair', address: pairAddress, baseCurrency })

  try {
    const token1 = await pair.methods.token1().call()
    const { reserve0, reserve1 } = await pair.methods.getReserves().call()
    const unitAmountA = utils.amount.formatWithDecimals(amountADesired, tokenADecimals)

    const reservesOrder =
      tokenA.toLowerCase() === token1.toLowerCase() ? [reserve1, reserve0] : [reserve0, reserve1]

    const tokenBAmount = await router.methods.quote(unitAmountA, ...reservesOrder).call()

    return utils.amount.formatWithoutDecimals(tokenBAmount, tokenBDecimals)
  } catch (error) {
    return error
  }
}

const returnSwapDataByMethod = async (
  params
): Promise<{
  args: any[]
  value?: string
}> => {
  let {
    chainId,
    provider,
    method,
    fromToken,
    fromTokenDecimals,
    toToken,
    toTokenDecimals,
    owner,
    deadlinePeriod,
    slippage,
    sellAmount,
    buyAmount,
  } = params

  if (!SwapMethods[method]) throw new Error('Wrong method')

  const chainNumber = Number(chainId)

  // Swaps available only for tokens. Replace native currency with a wrapped one
  fromToken = wrapCurrency(chainNumber, fromToken)
  toToken = wrapCurrency(chainNumber, toToken)

  const path = [fromToken, toToken]
  const deadline = await getDeadline(provider, deadlinePeriod)

  const weiSellAmount = utils.amount.formatWithDecimals(sellAmount, fromTokenDecimals)
  const weiBuyAmount = utils.amount.formatWithDecimals(buyAmount, toTokenDecimals)
  const buySlilppageRange = getSlippageRange(slippage, weiBuyAmount)

  // the minimum amount of the purchased asset to be received
  const intOutMin = getMinAmount(weiBuyAmount, buySlilppageRange)
  const amountOutMin = utils.amount.toHexNumber(intOutMin)
  const amountIn = weiSellAmount

  switch (method) {
    case SwapMethods.swapExactETHForTokensSupportingFeeOnTransferTokens:
    case SwapMethods.swapExactETHForTokens:
      return {
        args: [amountOutMin, path, owner, deadline],
        // without decimals and not in hex format, because we do it in the actions
        value: sellAmount,
      }

    case SwapMethods.swapExactTokensForTokensSupportingFeeOnTransferTokens:
    case SwapMethods.swapExactTokensForETHSupportingFeeOnTransferTokens:
    case SwapMethods.swapExactTokensForETH:
    case SwapMethods.swapExactTokensForTokens:
      return {
        args: [amountIn, amountOutMin, path, owner, deadline],
      }
  }

  return { args: [] }
}

const returnSwapMethod = (params) => {
  const { fromToken, toToken, useFeeOnTransfer } = params

  if (
    fromToken.toLowerCase() === constants.ADDRESSES.EVM_COIN_ADDRESS &&
    toToken.toLowerCase() === constants.ADDRESSES.EVM_COIN_ADDRESS
  ) {
    throw new Error('Swap between two native coins')
  }

  if (fromToken.toLowerCase() === constants.ADDRESSES.EVM_COIN_ADDRESS) {
    return useFeeOnTransfer
      ? SwapMethods.swapExactETHForTokensSupportingFeeOnTransferTokens
      : SwapMethods.swapExactETHForTokens
  } else if (toToken.toLowerCase() === constants.ADDRESSES.EVM_COIN_ADDRESS) {
    return useFeeOnTransfer
      ? SwapMethods.swapExactTokensForETHSupportingFeeOnTransferTokens
      : SwapMethods.swapExactTokensForETH
  } else {
    return useFeeOnTransfer
      ? SwapMethods.swapExactTokensForTokensSupportingFeeOnTransferTokens
      : SwapMethods.swapExactTokensForTokens
  }
}

const swapCallback = async (params) => {
  const {
    routerAddress,
    baseCurrency,
    owner,
    fromToken,
    fromTokenDecimals,
    toToken,
    toTokenDecimals,
    deadlinePeriod,
    slippage,
    sellAmount,
    buyAmount,
    waitReceipt = false,
    useFeeOnTransfer,
  } = params

  try {
    const provider = actions[baseCurrency.toLowerCase()].getWeb3()
    const router = getContract({ name: 'router', address: routerAddress, baseCurrency })
    const method = returnSwapMethod({ fromToken, toToken, useFeeOnTransfer })
    const swapData = await returnSwapDataByMethod({
      chainId: actions[baseCurrency.toLowerCase()].chainId,
      slippage,
      provider,
      method,
      fromToken,
      fromTokenDecimals,
      toToken,
      toTokenDecimals,
      owner,
      deadlinePeriod,
      sellAmount,
      buyAmount,
    })

    const txData = router.methods[method](...swapData.args).encodeABI()

    return actions[baseCurrency.toLowerCase()].send({
      to: routerAddress,
      data: txData,
      waitReceipt,
      amount: swapData.value ?? 0,
    })
  } catch (error) {
    return error
  }
}

const returnAddLiquidityData = async (params) => {
  const {
    provider,
    slippage,
    tokenA,
    tokenADecimals,
    amountADesired,
    tokenB,
    tokenBDecimals,
    amountBDesired,
    owner,
    deadlinePeriod,
  } = params
  const lowerTokenA = tokenA.toLowerCase()
  const lowerTokenB = tokenB.toLowerCase()
  let method: string
  let args: (string | number)[]
  let value: number = 0

  if (
    lowerTokenA === constants.ADDRESSES.EVM_COIN_ADDRESS &&
    lowerTokenB === constants.ADDRESSES.EVM_COIN_ADDRESS
  ) {
    throw new Error('Two native coins')
  }

  const { formatWithDecimals, toHexNumber } = utils.amount
  const deadline = await getDeadline(provider, deadlinePeriod)
  const unitAmountADesired = formatWithDecimals(amountADesired, tokenADecimals)
  const unitAmountBDesired = formatWithDecimals(amountBDesired, tokenBDecimals)

  const amountASlippageRange = getSlippageRange(
    slippage,
    formatWithDecimals(amountADesired, tokenADecimals)
  )
  const amountBSlippageRange = getSlippageRange(
    slippage,
    formatWithDecimals(amountBDesired, tokenBDecimals)
  )

  const amountAMin = getMinAmount(unitAmountADesired, amountASlippageRange)
  const amountBMin = getMinAmount(unitAmountBDesired, amountBSlippageRange)
  const hexAmountADesired = toHexNumber(unitAmountADesired)
  const hexAmountBDesired = toHexNumber(unitAmountBDesired)
  const hexAmountAMin = toHexNumber(amountAMin)
  const hexAmountBMin = toHexNumber(amountBMin)

  if (
    lowerTokenA === constants.ADDRESSES.EVM_COIN_ADDRESS ||
    lowerTokenB === constants.ADDRESSES.EVM_COIN_ADDRESS
  ) {
    const tokenAIsNative = lowerTokenA === constants.ADDRESSES.EVM_COIN_ADDRESS

    method = LiquidityMethods.addLiquidityETH
    value = tokenAIsNative ? amountADesired : amountBDesired
    args = [
      tokenAIsNative ? tokenB : tokenA,
      tokenAIsNative ? hexAmountBDesired : hexAmountADesired,
      tokenAIsNative ? hexAmountBMin : hexAmountAMin,
      tokenAIsNative ? hexAmountAMin : hexAmountBMin,
      owner,
      deadline,
    ]
  } else {
    method = LiquidityMethods.addLiquidity
    args = [
      tokenA,
      tokenB,
      hexAmountADesired,
      hexAmountBDesired,
      hexAmountBMin,
      hexAmountBMin,
      owner,
      deadline,
    ]
  }

  return {
    method,
    args,
    value,
  }
}

const addLiquidityCallback = async (params) => {
  const {
    routerAddress,
    baseCurrency,
    waitReceipt = false,
    tokenA,
    tokenADecimals,
    amountADesired,
    tokenB,
    tokenBDecimals,
    amountBDesired,
    owner,
    deadlinePeriod,
  } = params
  let { slippage } = params

  const provider = actions[baseCurrency.toLowerCase()].getWeb3()
  const { method, args, value } = await returnAddLiquidityData({
    provider,
    tokenA,
    tokenADecimals,
    amountADesired,
    slippage,
    tokenB,
    tokenBDecimals,
    amountBDesired,
    owner,
    deadlinePeriod,
  })
  const router = getContract({ name: 'router', address: routerAddress, baseCurrency })
  const txData = router.methods[method](...args).encodeABI()

  try {
    const hexValue = new BigNumber(value).multipliedBy(10 ** 18).toString(16)
    const gasLimit = await router.methods[method](...args).estimateGas({
      from: owner,
      value: `0x${hexValue}`,
    })
    const additionGasMultiplier = 1.1

    return actions[baseCurrency.toLowerCase()].send({
      to: routerAddress,
      data: txData,
      waitReceipt,
      amount: value,
      gasLimit: new BigNumber(gasLimit).multipliedBy(additionGasMultiplier).toFixed(0) || 0,
    })
  } catch (error) {
    console.group('%c add liquidity', 'color: red')
    console.error(error)
    console.groupEnd()
    return false
  }
}

export default {
  getContract,
  getPairAddress,
  getAmountOut,
  getLiquidityAmountForAssetB,
  swapCallback,
  addLiquidityCallback,
}
