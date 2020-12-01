import * as fs from 'fs'
import { Networks } from 'common/domain/network'


let _hasTradeConfig : boolean = false
let _tradeConfig : any = false
let _mnemonic : string | boolean = false
let _network : Networks = Networks.testnet

const setNetwork = (network:Networks) : void => {
  console.log(`>>> Switch network to ${network}`)
  _network = network
}

const getNetwork = ():Networks => {
  return _network
}

const setMnemonic = (newMnemonic:string) => {
  _mnemonic = newMnemonic
}

const getMnemonic = ():string|boolean => {
  return _mnemonic
}

const hasTradeConfig = ():boolean => { return _hasTradeConfig }

const getTradeTickers = () : Array<string> | boolean => {
  if (_hasTradeConfig
    && _tradeConfig
    && _tradeConfig.PAIRS
  ) {
    const tickers: Array<string> = Object.keys(_tradeConfig.PAIRS)
    return tickers
  }
  return false
}

const getCoinPriceConfig = (coin:string):any => {
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

const getMinAmount = ():any => {
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

const getTradePairs = ():any => {
  if (_hasTradeConfig
    && _tradeConfig
    && _tradeConfig.PAIRS
  ) return _tradeConfig.PAIRS
  return false
}

const loadJson = (network?:Networks = Networks.testnet) : boolean => {
  _hasTradeConfig = false
  const filePath = `${__dirname}/../../../tradeconfig.${network}.json`
  if (fs.existsSync(filePath)) {
    const rawdata = fs.readFileSync(filePath)
    try {
      console.log(`>>> Loaded trade config 'tradeconfig.${network}.json'`)
      const data = JSON.parse(rawdata.toString())
      console.log(data)
      _tradeConfig = data
      _hasTradeConfig = true
      return true
    } catch (e) {
      console.warn(`Fail parse trade config 'tradeconfig.${network}.json'. Use defaults`)
      return false
    }
  } else {
    console.warn(`Trade config 'tradeconfig.${network}.json' not found. Use defaults`)
    _hasTradeConfig = false
    return false
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
}