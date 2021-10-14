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
  const {
    provider,
    method,
    fromContract,
    fromContractDecimals,
    toContract,
    toContractDecimals,
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

  const path = [fromContract, toContract]
  // after this time, the transaction will be canceled
  const deadline = `0x${new BigNumber(timestamp).plus(deadlinePeriod).toString(16)}`

  const weiSellAmount = utils.amount.formatWithDecimals(sellAmount, fromContractDecimals)
  const weiBuyAmount = utils.amount.formatWithDecimals(buyAmount, toContractDecimals)

  const availableSlippageRange = new BigNumber(weiBuyAmount).div(100).times(slippage)
  // the minimum amount of the purchased asset to be received
  const amountOutMin = `0x${new BigNumber(weiBuyAmount).minus(availableSlippageRange).toString(16)}`
  const amountIn = `0x${new BigNumber(weiSellAmount).toString(16)}`

  switch (method) {
    case SwapMethods.swapExactETHForTokens:
      return {
        args: [amountOutMin, path, owner, deadline],
        value: amountIn,
      }

    case SwapMethods.swapExactTokensForETH:
    case SwapMethods.swapExactTokensForTokens:
      return {
        args: [amountIn, amountOutMin, path, owner, deadline],
      }
  }

  return { args: [] }
}

const returnSwapMethod = (params) => {
  const { fromContract, toContract } = params

  if (
    fromContract.toLowerCase() === constants.EVM_COIN_ADDRESS &&
    toContract.toLowerCase() === constants.EVM_COIN_ADDRESS
  ) {
    throw new Error('Swap between two native coins')
  }

  if (fromContract.toLowerCase() === constants.EVM_COIN_ADDRESS) {
    return SwapMethods.swapExactETHForTokens
  } else if (toContract.toLowerCase() === constants.EVM_COIN_ADDRESS) {
    return SwapMethods.swapExactTokensForETH
  } else {
    return SwapMethods.swapExactTokensForTokens
  }
}

const swapCallback = async (params) => {
  const {
    routerAddress,
    baseCurrency,
    ownerAddress,
    fromContract,
    fromContractDecimals,
    toContract,
    toContractDecimals,
    deadlinePeriod,
    slippage,
    sellAmount,
    buyAmount,
  } = params

  if (!deadlinePeriod) {
    throw new Error('No deadline period')
  }

  const provider = actions[baseCurrency.toLowerCase()].getWeb3()
  const router = getRouterContract({ routerAddress, provider })
  const method = returnSwapMethod({ fromContract, toContract })
  const swapData = await returnSwapDataByMethod({
    slippage,
    provider,
    method,
    fromContract,
    fromContractDecimals,
    toContract,
    toContractDecimals,
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

  return router[method](...swapData.args, {
    ...(swapData.value ? { value: swapData.value, from: ownerAddress } : { from: ownerAddress }),
  })
    .then((response: any) => {
      console.log('%c router response', 'color:brown;font-size:20px')
      console.log('response: ', response)

      return response.hash
    })
    .catch((error: any) => {
      const REJECT_CODE = 4001

      if (error?.code === REJECT_CODE) {
        return console.log('Rejected')
      }

      throw new Error(`Swap failed: ${error.message}`)
    })
}

export default {
  getContract,
  getRouterContract,
  swapCallback,
}
