import { config as testnetConfig } from './testnet'
import { config as mainnetConfig } from './mainnet'

import { getConfig } from './getConfig'

import { EthTokenSwap } from 'swap.swaps'
import { default as tokenSwapConfig } from './tokenSwap'

const testnet = getConfig(testnetConfig)
const mainnet = getConfig(mainnetConfig)
const tokenSwap = (config) => new EthTokenSwap(tokenSwapConfig(config))

export {
  testnet,
  mainnet,
  tokenSwap,
}
