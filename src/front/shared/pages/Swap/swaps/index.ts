import config from 'app-config'

import {
  UTXO_to_ERC20,
  ERC20_to_UTXO,
  UTXO_to_ETH,
  ETH_to_UTXO
} from './build'


const swapComponents = {}
Object.keys(config.swapConfig).forEach(coin => {
  swapComponents[`${coin.toUpperCase()}2ETH`] = UTXO_to_ETH(coin)
  swapComponents[`ETH2${coin.toUpperCase()}`] = ETH_to_UTXO(coin)
  Object.keys(config.erc20).forEach(tokenName => {
  swapComponents[`${tokenName.toUpperCase()}2${coin.toUpperCase()}`] = ERC20_to_UTXO(coin)
    swapComponents[`${coin.toUpperCase()}2${tokenName.toUpperCase()}`] = UTXO_to_ERC20(coin)
  })
})
  

export {
  swapComponents,
}
