import config from 'app-config'

export type TokenStandard = {
  platform: string
  platformKey: string
  standard: string
  value: string
  currency: string
  explorerApi: string
  explorerApiKey: string
  hasSupportAtomicSwap: boolean
}

export default {
  erc20: {
    platform: 'ethereum',
    platformKey: 'ethereum',
    standard: 'erc20',
    value: 'erc20',
    currency: 'eth',
    explorerApi: config.api.etherscan,
    explorerApiKey: config.api.etherscan_ApiKey,
    hasSupportAtomicSwap: true,
  },
  bep20: {
    platform: 'binance smart chain',
    platformKey: 'binance-smart-chain',
    standard: 'bep20',
    value: 'bep20',
    currency: 'bnb',
    explorerApi: config.api.bscscan,
    explorerApiKey: config.api.bscscan_ApiKey,
    hasSupportAtomicSwap: true,
  },
  erc20matic: {
    platform: 'ethereum',
    platformKey: 'polygon-pos',
    standard: 'erc20matic',
    value: 'erc20matic',
    currency: 'matic',
    explorerApi: config.api.maticscan,
    explorerApiKey: config.api.polygon_ApiKey,
    hasSupportAtomicSwap: true,
  },
  erc20xdai: {
    platform: 'ethereum',
    platformKey: 'xdai',
    standard: 'erc20xdai',
    value: 'erc20xdai',
    currency: 'xdai',
    explorerApi: '',
    explorerApiKey: '',
    hasSupportAtomicSwap: false,
  },
  erc20ftm: {
    platform: 'ethereum',
    platformKey: 'fantom',
    standard: 'erc20ftm',
    value: 'erc20ftm',
    currency: 'ftm',
    explorerApi: config.api.ftmscan,
    explorerApiKey: config.api.ftm_ApiKey,
    hasSupportAtomicSwap: false,
  },
}
