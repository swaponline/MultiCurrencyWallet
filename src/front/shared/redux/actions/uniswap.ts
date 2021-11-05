import BigNumber from 'bignumber.js'
import { abi as FactoryV2ABI } from '@uniswap/v2-periphery/build/IUniswapV2Factory.json'
import { abi as RouterV2ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import ethLikeHelper from 'common/helpers/ethLikeHelper'
import constants from 'common/helpers/constants'
import utils from 'common/utils'
import actions from 'redux/actions'

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
  name: 'factory' | 'router'
  address: string
  baseCurrency: string
}

const wrapCurrency = (chainId: number, currencyAddress: string) => {
  const { WrapperCurrency, EVM_COIN_ADDRESS } = constants.ADDRESSES

  return currencyAddress === EVM_COIN_ADDRESS ? WrapperCurrency[chainId] : currencyAddress
}

const getContract = (params: GetContractParams) => {
  const { name, address, baseCurrency } = params

  return ethLikeHelper[baseCurrency.toLowerCase()]?.getContract({
    abi: name === 'factory' ? FactoryV2ABI : RouterV2ABI,
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
    return error
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

const checkAndApproveToken = async (params) => {
  const { standard, token, owner, decimals, spender, sellAmount, tokenName } = params

  const allowance = await actions.oneinch.fetchTokenAllowance({
    contract: token,
    standard,
    owner,
    decimals,
    spender,
  })

  return new Promise(async (res, rej) => {
    if (new BigNumber(sellAmount).isGreaterThan(allowance)) {
      const result = await actions[standard].approve({
        name: tokenName,
        to: spender,
        amount: sellAmount,
      })

      return result instanceof Error ? rej(result) : res(result)
    }

    res(true)
  })
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
    fromTokenStandard,
    fromTokenName,
    waitReceipt = false,
    useFeeOnTransfer,
  } = params

  if (!deadlinePeriod) {
    throw new Error('No deadline period')
  }

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

  if (!router) {
    throw new Error('No router contract found')
  } else if (router[method]) {
    throw new Error('No such method in the router contract')
  } else if (!swapData.args.length) {
    throw new Error('No arguments')
  }

  // TODO: we need to approve both tokens

  try {
    if (fromTokenStandard && fromToken.toLowerCase() !== constants.ADDRESSES.EVM_COIN_ADDRESS) {
      const result = await checkAndApproveToken({
        tokenName: fromTokenName,
        sellAmount,
        standard: fromTokenStandard,
        token: fromToken,
        owner,
        decimals: fromTokenDecimals,
        spender: routerAddress,
      })

      if (!result) return result
    }

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
  let value: number | null

  if (
    lowerTokenA === constants.ADDRESSES.EVM_COIN_ADDRESS &&
    lowerTokenB === constants.ADDRESSES.EVM_COIN_ADDRESS
  ) {
    throw new Error('Two native coins')
  }

  // TODO: add tokens approve
  /*
  ! If a pool for the passed token and WETH does not exists,
  ! one is created automatically, and exactly amountTokenDesired/msg.value
  ! tokens are added.
  */

  const { formatWithDecimals, toHexNumber } = utils.amount
  const deadline = await getDeadline(provider, deadlinePeriod)
  const unitAmountADesired = formatWithDecimals(amountADesired, tokenADecimals)
  const unitAmountBDesired = formatWithDecimals(amountBDesired, tokenBDecimals)

  // ! Drop slippage percent if it's first liquidity addition
  // ? check a pool existence manually in this function ?

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
    value = null
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
    slippage,
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
    return actions[baseCurrency.toLowerCase()].send({
      to: routerAddress,
      data: txData,
      waitReceipt,
      amount: value ?? 0,
    })
  } catch (error) {
    return error
  }
}

export default {
  getContract,
  getPairAddress,
  getAmountOut,
  swapCallback,
  addLiquidityCallback,
}
