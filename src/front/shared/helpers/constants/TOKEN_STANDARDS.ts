import config from 'app-config'

export default {
  erc20: {
    platform: 'ethereum',
    standard: 'erc20',
    currency: 'eth',
    explorerApi: config.api.etherscan,
    explorerApiKey: config.api.etherscan_ApiKey,
  },
  bep20: {
    platform: 'binance smart chain',
    standard: 'bep20',
    currency: 'bnb',
    explorerApi: config.api.bscscan,
    explorerApiKey: config.api.bscscan_ApiKey,
  },
  erc20matic: {
    platform: 'ethereum',
    standard: 'erc20matic',
    currency: 'matic',
    explorerApi: config.api.maticscan,
    explorerApiKey: config.api.polygon_ApiKey,
  },
}