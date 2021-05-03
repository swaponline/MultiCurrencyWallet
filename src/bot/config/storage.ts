import * as fs from 'fs'
import BigNumber from 'bignumber.js'

import { Networks } from 'common/domain/network'
import { FG_COLORS as COLORS, colorString } from 'common/utils/colorString'


let _hasTradeConfig: boolean = false
let _tradeConfig: any = false
let _mnemonic: string | boolean = false
let _network: Networks = Networks.testnet
let _customERC: Array<any> = new Array()

const _processERC20 = () : void => {
  _customERC = new Array()
  Object.keys(_tradeConfig.COINS).forEach((name) => {
    if (_tradeConfig.COINS[name].ERC20
      && _tradeConfig.COINS[name].ERC20.address
      && _tradeConfig.COINS[name].ERC20.decimals
    ) {
      const { address, decimals } = _tradeConfig.COINS[name].ERC20
      _customERC.push({
        name,
        address,
        decimals: new BigNumber(decimals).toNumber(),
      })
    }
  })
}

const getCustomERC20 = (): Array<any> => {
  return _customERC
}

const setNetwork = (network: Networks): void => {
  console.log(
    colorString(`>>> Switch network to`, COLORS.GREEN),
    colorString(network, COLORS.RED)
  )
  _network = network
}

const getNetwork = (): Networks => {
  return _network
}

const setMnemonic = (newMnemonic: string) => {
  _mnemonic = newMnemonic
}

const getMnemonic = (): string | boolean => {
  return _mnemonic
}

const hasTradeConfig = (): boolean => {
  return _hasTradeConfig
}

const getTradeTickers = (): Array<string> | boolean => {
  if (_hasTradeConfig
    && _tradeConfig
    && _tradeConfig.PAIRS
  ) {
    const tickers: Array<string> = Object.keys(_tradeConfig.PAIRS)
    return tickers
  }
  return false
}

const getCoinPriceConfig = (coin: string): any => {
  if (_hasTradeConfig
    && _tradeConfig
    && _tradeConfig.COINS
    && _tradeConfig.COINS[coin]
    && _tradeConfig.COINS[coin].price
  ) {
    return _tradeConfig.COINS[coin].price
  }
  return false
}

const getMinAmount = (): any => {
  if (_hasTradeConfig
    && _tradeConfig
    && _tradeConfig.COINS
  ) {
    const mins = {
      default: 0.0005
    }
    Object.keys(_tradeConfig.COINS).forEach((coin) => {
      mins[coin] = _tradeConfig.COINS[coin].minAmount
    })
    return mins
  }
  return false
}

const getTradePairs = (): any => {
  if (_hasTradeConfig
    && _tradeConfig
    && _tradeConfig.PAIRS
  ) return _tradeConfig.PAIRS
  return false
}

//@ts-ignore: strictNullChecks
const loadJson = (network: Networks = Networks.testnet): boolean => {
  _hasTradeConfig = false
  const filePath = `${__dirname}/../../../tradeconfig.${network}.json`
  if (fs.existsSync(filePath)) {
    const rawdata = fs.readFileSync(filePath)

    try {
      console.log(
        colorString(`>>> Loaded trade config `, COLORS.GREEN),
        colorString(`tradeconfig.${network}.json`, COLORS.RED)
      )
      const data = JSON.parse(rawdata.toString())
      _tradeConfig = data
      _hasTradeConfig = true
      _processERC20()
      return true
    } catch (e) {
      console.log(colorString('Parse trade config error', COLORS.RED), e)
      console.warn(`Fail parse trade config 'tradeconfig.${network}.json'. Use defaults`)
      return false
    }
  } else {
    if (process.env.TEST_STARTUP !== `true`) {
      console.log(
        colorString(`Trade config 'tradeconfig.${network}.json' not found. Use defaults`, COLORS.RED)
      )
      process.exit(0)
    }
  }
}

export {
  setMnemonic,
  getMnemonic,
  loadJson,
  setNetwork,
  getNetwork,
  hasTradeConfig,
  getTradePairs,
  getTradeTickers,
  getMinAmount,
  getCoinPriceConfig,
  getCustomERC20,
}
