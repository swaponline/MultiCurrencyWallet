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
  erc20Matic: {
    platform: 'matic chain',
    standard: 'erc20Matic',
    currency: 'matic',
    // explorerApi: config.api,
    // explorerApiKey: config.api,
  },
}