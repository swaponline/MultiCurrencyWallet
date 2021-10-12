import { abi as RouterV2ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import constants from 'common/helpers/constants'
import externalConfig from 'helpers/externalConfig'

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

  return new provider.eth.Contract(address, abi)
}

const getRouterContract = (params: { routerAddress: string; provider: EthereumProvider }) => {
  const { routerAddress, provider } = params

  return getContract({ address: routerAddress, abi: RouterV2ABI, provider })
}

const returnSwapDataByMethod = (
  params
): {
  args: any[]
  value?: number
} => {
  const { method, fromContract, toContract, swap, owner } = params

  if (!SwapMethods[method]) throw new Error('Wrong method')

  const { sellAmount } = swap
  const path = [fromContract, toContract]
  const deadline = 0
  let amountOutMin = 0
  let amountIn = sellAmount

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
  const { routerAddress, provider, ownerAddress, swap, fromContract, toContract } = params
  const router = getRouterContract({ routerAddress, provider })

  // check token approved amount for the Router contract
  // approve if it's necessary

  const method = returnSwapMethod({ fromContract, toContract })
  const swapData = returnSwapDataByMethod({
    method,
    fromContract,
    toContract,
    swap,
    owner: ownerAddress,
  })

  if (!router) {
    throw new Error('No router contract found')
  } else if (router[method]) {
    throw new Error('No such method in the router contract')
  } else if (!swapData.args.length) {
    throw new Error('No arguments')
  }

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
