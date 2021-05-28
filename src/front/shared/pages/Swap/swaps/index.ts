import config from 'app-config'

import {
  UTXO_to_ERC20,
  UTXO_to_BEP20,
  ERC20_to_UTXO,
  BEP20_to_UTXO,
  UTXO_to_ETH,
  ETH_to_UTXO,
  UTXO_to_BNB,
  BNB_to_UTXO,
} from './build'


const swapComponents = {}
swapComponents[`BTC2BNB`] = UTXO_to_BNB(`btc`)
swapComponents[`BNB2BTC`] = BNB_to_UTXO(`btc`)

Object.keys(config.swapConfig).forEach(coin => {
  swapComponents[`${coin.toUpperCase()}2ETH`] = UTXO_to_ETH(coin)
  swapComponents[`ETH2${coin.toUpperCase()}`] = ETH_to_UTXO(coin)
  Object.keys(config.erc20).forEach(tokenName => {
  swapComponents[`{ETH}${tokenName.toUpperCase()}2${coin.toUpperCase()}`] = ERC20_to_UTXO(coin)
    swapComponents[`${coin.toUpperCase()}2{ETH}${tokenName.toUpperCase()}`] = UTXO_to_ERC20(coin)
  })
})
Object.keys(config.bep20).forEach(tokenName => {
swapComponents[`{BNB}${tokenName.toUpperCase()}2BTC`] = BEP20_to_UTXO(`BTC`)
  swapComponents[`BTC2{BNB}${tokenName.toUpperCase()}`] = UTXO_to_BEP20(`BTC`)
})
  
window.swapComponents = swapComponents
export {
  swapComponents,
}
