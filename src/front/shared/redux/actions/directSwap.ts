import BigNumber from 'bignumber.js'
import { abi as RouterV2ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import constants from 'common/helpers/constants'
import utils from 'common/utils'
import externalConfig from 'helpers/externalConfig'
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

const getContract = (params) => {
  const { address, abi, provider } = params

  return new provider.eth.Contract(abi, address)
}

const getRouterContract = (params: { routerAddress: string; provider: EthereumProvider }) => {
  const { routerAddress, provider } = params

  return getContract({ address: routerAddress, abi: RouterV2ABI, provider })
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

  const latestBlockNumber = await provider.eth.getBlockNumber()
  const latestBlock = await provider.eth.getBlock(latestBlockNumber)
  const timestamp = latestBlock.timestamp

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
  // after this time, the transaction will be canceled
  const deadline = `0x${new BigNumber(timestamp).plus(deadlinePeriod).toString(16)}`

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
  const { fromToken, toToken } = params

  if (
    fromToken.toLowerCase() === constants.ADDRESSES.EVM_COIN_ADDRESS &&
    toToken.toLowerCase() === constants.ADDRESSES.EVM_COIN_ADDRESS
  ) {
    throw new Error('Swap between two native coins')
  }

  if (fromToken.toLowerCase() === constants.ADDRESSES.EVM_COIN_ADDRESS) {
    return SwapMethods.swapExactETHForTokens
    // return SwapMethods.swapExactETHForTokensSupportingFeeOnTransferTokens
  } else if (toToken.toLowerCase() === constants.ADDRESSES.EVM_COIN_ADDRESS) {
    return SwapMethods.swapExactTokensForETH
    // return SwapMethods.swapExactTokensForETHSupportingFeeOnTransferTokens
  } else {
    return SwapMethods.swapExactTokensForTokens
    // return SwapMethods.swapExactTokensForTokensSupportingFeeOnTransferTokens
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
        amount: new BigNumber(sellAmount).multipliedBy(1000).toNumber(),
      })

      return typeof result === 'string' ? res(result) : rej(result)
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
  } = params

  if (!deadlinePeriod) {
    throw new Error('No deadline period')
  }

  const provider = actions[baseCurrency.toLowerCase()].getWeb3()
  const router = getRouterContract({ routerAddress, provider })
  const method = returnSwapMethod({ fromToken, toToken })
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

  console.log('%c swap callback', 'color:orange;font-size:20px')
  console.log('params: ', params)
  console.log('method: ', method)
  console.log('swapData: ', swapData)
  console.log('router: ', router)

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
    console.group('%c swapCallback', 'color: red;')
    console.error(error)
    console.groupEnd()
  }
}

export default {
  getContract,
  getRouterContract,
  swapCallback,
}
