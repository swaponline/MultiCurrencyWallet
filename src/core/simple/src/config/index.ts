import testnet from './testnet'
import mainnet from './mainnet'

import getConfig from './getConfig'

import { EthTokenSwap } from 'swap.swaps'
import tokenSwap from './tokenSwap'

export default {
  testnet: getConfig(testnet),
  mainnet: getConfig(mainnet),
  //@ts-ignore
  tokenSwap: (config) => new EthTokenSwap(tokenSwap(config)()),
}
