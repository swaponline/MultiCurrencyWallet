import config from 'app-config'

import BtcToEth from '../BtcToEth'
import EthToBtc from '../EthToBtc'

import BtcToGhost from '../BtcToGhost'
import GhostToBtc from '../GhostToBtc'

import EthToGhost from '../EthToGhost'
import GhostToEth from '../GhostToEth'

import EthTokenToBtc from '../EthTokenToBtc'
import BtcToEthToken from '../BtcToEthToken'

import EthTokenToGhost from '../EthTokenToGhost'
import GhostToEthToken from '../GhostToEthToken'


import EthToNext from '../EthToNext'
import NextToEth from '../NextToEth'
// import EthTokenToUsdt from '../EthTokenToUsdt'
// import UsdtToEthToken from '../UsdtToEthToken'


const swapComponents = {
  'BTC2ETH': BtcToEth,
  'ETH2BTC': EthToBtc,

  'BTC2GHOST': BtcToGhost,
  'GHOST2BTC': GhostToBtc,

  'ETH2GHOST': EthToGhost,
  'GHOST2ETH': GhostToEth,

  'SWAP2BTC': EthTokenToBtc,
  'BTC2SWAP': BtcToEthToken,

  'ETH2NEXT': EthToNext,
  'NEXT2ETH': NextToEth,
  // 'SWAP2USDT': EthTokenToUsdt,
  // 'USDT2SWAP': UsdtToEthToken,
}


Object.keys(config.erc20)
  .forEach(key => {
    swapComponents[`${key.toUpperCase()}2BTC`] = EthTokenToBtc
    swapComponents[`BTC2${key.toUpperCase()}`] = BtcToEthToken

    // swapComponents[`${key.toUpperCase()}2USDT`] = EthTokenToUsdt
    // swapComponents[`USDT2${key.toUpperCase()}`] = UsdtToEthToken
  })

  Object.keys(config.erc20)
  .forEach(key => {
    swapComponents[`${key.toUpperCase()}2GHOST`] = EthTokenToGhost
    swapComponents[`GHOST2${key.toUpperCase()}`] = GhostToEthToken

    // swapComponents[`${key.toUpperCase()}2USDT`] = EthTokenToUsdt
    // swapComponents[`USDT2${key.toUpperCase()}`] = UsdtToEthToken
  })


export {
  swapComponents,
}
