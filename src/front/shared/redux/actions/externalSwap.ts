import { abi as RouterV2ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import externalConfig from 'helpers/externalConfig'

const getContract = (params) => {
  const {} = params

  return false
}

const getRouterContract = (params: {
  routerAddress: string
  chainId: number
  provider: EthereumProvider
  account: string
}) => {
  const { routerAddress, chainId, provider, account } = params

  return getContract({ address: routerAddress, abi: RouterV2ABI, provider, account })
}

const swapCallback = async (params) => {
  const { routerAddress } = params

  const router = getRouterContract({ address: routerAddress })

  if (!router) return
}

export default {
  getContract,
  getRouterContract,
  swapCallback,
}
