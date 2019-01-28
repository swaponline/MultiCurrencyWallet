import config from 'app-config'

import LtcToEth from '../LtcToEth'
import EthToLtc from '../EthToLtc'

import BtcToLtc from '../BtcToLtc'
import LtcToBtc from '../LtcToBtc'

import BtcToEos from '../BtcToEos'
import EosToBtc from '../EosToBtc'


const swapComponents = {

  'LTC2ETH': LtcToEth,
  'ETH2LTC': EthToLtc,

  'BTC2LTC': BtcToLtc,
  'LTC2BTC': LtcToBtc,

  'BTC2EOS': BtcToEos,
  'EOS2BTC': EosToBtc,
}

export {
  swapComponents,
}
