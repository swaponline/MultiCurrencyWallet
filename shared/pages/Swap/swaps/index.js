import config from 'app-config'

import BtcToEth from '../BtcToEth'
import EthToBtc from '../EthToBtc'

import LtcToEth from '../LtcToEth'
import EthToLtc from '../EthToLtc'

import BtcToLtc from '../BtcToLtc'
import LtcToBtc from '../LtcToBtc'

import EthToBch from '../EthToBch'
import BchToEth from '../BchToEth'

import BtcToEos from '../BtcToEos'
import EosToBtc from '../EosToBtc'

import EthTokenToBtc from '../EthTokenToBtc'
import BtcToEthToken from '../BtcToEthToken'

import EthTokenToUSDTomni from '../EthTokenToUSDTomni'
import USDTomniToEthToken from '../USDTomniToEthToken'


const swapComponents = {
  'BTC2ETH': BtcToEth,
  'ETH2BTC': EthToBtc,

  'LTC2ETH': LtcToEth,
  'ETH2LTC': EthToLtc,

  'BTC2LTC': BtcToLtc,
  'LTC2BTC': LtcToBtc,

  'ETH2BCH': EthToBch,
  'BCH2ETH': BchToEth,

  'BTC2EOS': BtcToEos,
  'EOS2BTC': EosToBtc,

  'SWAP2BTC': EthTokenToBtc,
  'BTC2SWAP': BtcToEthToken,

  'SWAP2USDTomni': EthTokenToUSDTomni,
  'USDTomni2SWAP': USDTomniToEthToken,
}


Object.keys(config.erc20)
  .forEach(key => {
    swapComponents[`${key.toUpperCase()}2BTC`] = EthTokenToBtc
    swapComponents[`BTC2${key.toUpperCase()}`] = BtcToEthToken

    swapComponents[`${key.toUpperCase()}2USDTomni`] = EthTokenToUSDTomni
    swapComponents[`USDTomni2${key.toUpperCase()}`] = USDTomniToEthToken
  })

export {
  swapComponents,
}
