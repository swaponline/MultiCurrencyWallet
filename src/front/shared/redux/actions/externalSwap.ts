import { abi as RouterV2ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import externalConfig from 'helpers/externalConfig'

enum SwapMethods {
  swapExactETHForTokens,
  swapExactTokensForETH,
  swapExactTokensForTokens,
  swapTokensForExactTokens,
}

const getContract = (params) => {
  const { address, abi, provider, ownerAddress } = params

  return new provider.eth.Contract(address, abi)
}

const getRouterContract = (params: {
  routerAddress: string
  provider: EthereumProvider
  ownerAddress: string
}) => {
  const { routerAddress, provider, ownerAddress } = params

  return getContract({ address: routerAddress, abi: RouterV2ABI, provider, ownerAddress })
}

const createSwapArgsByMethod = (params): any[] => {
  const { method, fromToken, toToken, owner } = params

  if (!SwapMethods[method]) throw new Error('Wrong method')

  const path = [fromToken, toToken]
  const deadline = 0
  let amountOutMin = 0
  let amountIn = 0
  let amountOut = 0
  let amountInMax = 0

  switch (method) {
    case SwapMethods.swapExactETHForTokens:
      return [amountOutMin, path, owner, deadline]

    case SwapMethods.swapExactTokensForETH:
      return [amountIn, amountOutMin, path, owner, deadline]

    case SwapMethods.swapExactTokensForTokens:
      return [amountIn, amountOutMin, path, owner, deadline]

    case SwapMethods.swapTokensForExactTokens:
      return [amountOut, amountInMax, path, owner, deadline]
  }

  return []
}

// don't forget about approve the sended tokens if it's necessary
const swapCallback = async (params) => {
  const { routerAddress, provider, ownerAddress, swapData, fromToken, toToken } = params

  const router = getRouterContract({ routerAddress, provider, ownerAddress })

  const method = ''
  const args = createSwapArgsByMethod({ method, fromToken, toToken })

  if (!router) {
    throw new Error('No router contract found')
  } else if (router[method]) {
    throw new Error('No such method in the router contract')
  } else if (!args.length) {
    throw new Error('No arguments')
  }

  return router[method](args)
    .then((response: any) => {
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
