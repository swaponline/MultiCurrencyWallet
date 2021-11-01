import BigNumber from 'bignumber.js'
import { abi as RouterV2ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
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

enum AddLiquidityMethods {
  addLiquidity = 'addLiquidity',
  addLiquidityETH = 'addLiquidityETH',
}

const getContract = (params) => {
  const { address, abi, provider } = params

  return new provider.eth.Contract(abi, address)
}

const getRouterContract = (params: { routerAddress: string; provider: EthereumProvider }) => {
  const { routerAddress, provider } = params

  return getContract({ address: routerAddress, abi: RouterV2ABI, provider })
}

const getDeadline = async (provider, deadlinePeriod): Promise<string> => {
  const latestBlockNumber = await provider.eth.getBlockNumber()
  const latestBlock = await provider.eth.getBlock(latestBlockNumber)
  const timestamp = latestBlock.timestamp

  return `0x${new BigNumber(timestamp).plus(deadlinePeriod).toString(16)}`
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
  const { WrapperCurrency } = constants.ADDRESSES

  // Swaps available only for tokens. Replace native currency with a wrapped one
  switch (constants.ADDRESSES.EVM_COIN_ADDRESS) {
    case fromToken.toLowerCase():
      fromToken = WrapperCurrency[chainNumber]
      break
    case toToken.toLowerCase():
      toToken = WrapperCurrency[chainNumber]
  }

  const path = [fromToken, toToken]
  const deadline = await getDeadline(provider, deadlinePeriod)

  const weiSellAmount = utils.amount.formatWithDecimals(sellAmount, fromTokenDecimals)
  const weiBuyAmount = utils.amount.formatWithDecimals(buyAmount, toTokenDecimals)

  const MAX_PERCENT = 100
  const availableSlippageRange = new BigNumber(weiBuyAmount)
    .div(MAX_PERCENT)
    .times(slippage)
    .toNumber()

  // the minimum amount of the purchased asset to be received
  const intOutMin = new BigNumber(weiBuyAmount)
    .minus(availableSlippageRange)
    .integerValue(BigNumber.ROUND_CEIL)

  const amountOutMin = `0x${intOutMin.toString(16)}`
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
    ownerAddress,
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
  const router = getRouterContract({ routerAddress, provider })
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
    owner: ownerAddress,
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
        owner: ownerAddress,
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
    tokenA,
    amountADesired,
    amountAMin,
    tokenB,
    amountBDesired,
    amountBMin,
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

  const deadline = await getDeadline(provider, deadlinePeriod)

  if (
    lowerTokenA === constants.ADDRESSES.EVM_COIN_ADDRESS ||
    lowerTokenB === constants.ADDRESSES.EVM_COIN_ADDRESS
  ) {
    const tokenAIsNative = lowerTokenA === constants.ADDRESSES.EVM_COIN_ADDRESS

    method = AddLiquidityMethods.addLiquidityETH
    value = tokenAIsNative ? amountADesired : amountBDesired

    /**
     * address token
     * uint amountTokenDesired
     * uint amountTokenMin
     * uint amountETHMin
     * address to
     * uint deadline
     *
     * return (amountToken, amountETH, liquidity)
     */
    args = [
      tokenAIsNative ? tokenB : tokenA,
      tokenAIsNative ? amountBDesired : amountADesired,
      tokenAIsNative ? amountBMin : amountAMin,
      tokenAIsNative ? amountAMin : amountBMin,
      owner,
      deadline,
    ]
  } else {
    method = AddLiquidityMethods.addLiquidity
    value = null

    /**
     * address tokenA
     * address tokenB
     * uint amountADesired
     * uint amountBDesired
     * uint amountAMin
     * uint amountBMin
     * address to
     * uint deadline
     *
     * return (amountA, amountB, liquidity)
     */
    args = [tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin, owner, deadline]
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
    provider,
    baseCurrency,
    waitReceipt = false,
    tokenA,
    amountADesired,
    amountAMin,
    tokenB,
    amountBDesired,
    amountBMin,
    owner,
    deadlinePeriod,
  } = params

  const { method, args, value } = await returnAddLiquidityData({
    provider,
    tokenA,
    amountADesired,
    amountAMin,
    tokenB,
    amountBDesired,
    amountBMin,
    owner,
    deadlinePeriod,
  })
  const router = getRouterContract({ routerAddress, provider })
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
  getRouterContract,
  swapCallback,
  addLiquidityCallback,
}
