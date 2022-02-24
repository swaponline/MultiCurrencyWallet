import config from 'app-config'

export default {
  erc20: {
    platform: 'ethereum',
    standard: 'erc20',
    currency: 'eth',
    explorerApi: config.api.etherscan,
    explorerApiKey: config.api.etherscan_ApiKey,
    hasSupportAtomicSwap: true,
  },
  bep20: {
    platform: 'binance smart chain',
    standard: 'bep20',
    currency: 'bnb',
    explorerApi: config.api.bscscan,
    explorerApiKey: config.api.bscscan_ApiKey,
    hasSupportAtomicSwap: true,
  },
  erc20matic: {
    platform: 'ethereum',
    standard: 'erc20matic',
    currency: 'matic',
    explorerApi: config.api.maticscan,
    explorerApiKey: config.api.polygon_ApiKey,
    hasSupportAtomicSwap: true,
  },
  erc20xdai: {
    platform: 'ethereum',
    standard: 'erc20xdai',
    currency: 'xdai',
    explorerApi: '',
    explorerApiKey: '',
    hasSupportAtomicSwap: false,
  },
  erc20ftm: {
    platform: 'ethereum',
    standard: 'erc20ftm',
    currency: 'ftm',
    explorerApi: config.api.ftmscan,
    explorerApiKey: config.api.ftm_ApiKey,
    hasSupportAtomicSwap: false,
  },
}