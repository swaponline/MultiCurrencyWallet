const network = process.env.NETWORK && process.env.NETWORK.toLowerCase() ||
  // todo: remove after moving network settings to `/common`
  (process.env.NODE_ENV === 'production' && 'mainnet') ||
  (process.env.NODE_ENV === 'development' && 'testnet') ||
  (() => { throw new Error('Unknown network') })()


const TRADE_TICKERS = require(`./${network}/TRADE_TICKERS`)
const TRADE_ORDER_MINAMOUNTS = require(`./${network}/TRADE_ORDER_MINAMOUNTS`)
const TRADE_LIMITS = require(`./${network}/TRADE_LIMITS`)
const TRADE_CONFIG = require(`./${network}/TRADE_CONFIG`)
const TOKENS = require(`./${network}/TOKENS`)
const TOKEN_DECIMALS = require(`./${network}/TOKEN_DECIMALS`)


export {
  TRADE_TICKERS,
  TRADE_ORDER_MINAMOUNTS,
  TRADE_LIMITS,
  TRADE_CONFIG,
  TOKENS,
  TOKEN_DECIMALS,
}
