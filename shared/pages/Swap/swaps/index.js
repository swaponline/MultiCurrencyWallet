import BtcToEth from '../BtcToEth'
import EthToBtc from '../EthToBtc'

import BtcToEos from '../BtcToEos'
import EosToBtc from '../EosToBtc'

import EthTokenToBtc from '../EthTokenToBtc'
import BtcToEthToken from '../BtcToEthToken'

import UsdtToEthToken from '../UsdtToEthToken'
import EthTokenToUsdt from '../EthTokenToUsdt'


export const swapComponents = {
  'BTC2ETH': BtcToEth,
  'ETH2BTC': EthToBtc,

  'BTC2EOS': BtcToEos,
  'EOS2BTC': EosToBtc,

  'SWAP2BTC': EthTokenToBtc,
  'BTC2SWAP': BtcToEthToken,

  'SWAP2USDT': EthTokenToUsdt,
  'USDT2SWAP': UsdtToEthToken,
}
