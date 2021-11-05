import config from 'app-config'

export const SOURCE_MODE_SLIPPAGE = {
  MAX: 50,
  FAIL: 0.5,
  FRONTRUN: 10,
}

export const GWEI_DECIMALS = 9
export const MAX_PERCENT = 100
export const SEC_PER_MINUTE = 60

export const API_NAME = {
  1: 'zeroxEthereum',
  56: 'zeroxBsc',
  137: 'zeroxPolygon',
}

export const API_GAS_LIMITS = {
  MAX_PRICE: '30_000',
  MIN_LIMIT: '100_000',
  MAX_LIMIT: '11_500_000',
}

export const ROUTERS = {
  [config.evmNetworks.ETH.networkVersion]: config.swapContract.uniswapRouter,
  [config.evmNetworks.BNB.networkVersion]: config.swapContract.pancakeswapRouter,
  [config.evmNetworks.MATIC.networkVersion]: config.swapContract.sushiswapRouter,
}
