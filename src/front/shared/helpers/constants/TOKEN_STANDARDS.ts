import config from 'app-config'

export type TokenStandard = {
  platform: string
  platformKey: string // CoinGecko platform key
  standard: string
  value: string
  currency: string
  explorerApi: string
  explorerApiKey: string
  hasSupportAtomicSwap: boolean
}

const STANDARDS = {
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
  erc20avax: {
    platform: 'ethereum',
    platformKey: 'avalanche',
    standard: 'erc20avax',
    value: 'erc20avax',
    currency: 'avax',
    explorerApi: config.api.avaxscan,
    explorerApiKey: config.api.avax_ApiKey,
    hasSupportAtomicSwap: false,
  },
  erc20movr: {
    platform: 'ethereum',
    platformKey: 'moonriver',
    standard: 'erc20movr',
    value: 'erc20movr',
    currency: 'movr',
    explorerApi: config.api.movrscan,
    explorerApiKey: config.api.movr_ApiKey,
    hasSupportAtomicSwap: false,
  },
  erc20one: {
    platform: 'ethereum',
    platformKey: 'harmony-shard-0',
    standard: 'erc20one',
    value: 'erc20one',
    currency: 'one',
    explorerApi: config.api.onescan,
    explorerApiKey: config.api.one_ApiKey,
    hasSupportAtomicSwap: false,
  },
  erc20ame: {
    platform: 'ethereum',
    platformKey: '',
    standard: 'erc20ame',
    value: 'erc20ame',
    currency: 'ame',
    explorerApi: config.api.amescan,
    explorerApiKey: config.api.ame_ApiKey,
    hasSupportAtomicSwap: false,
  },
  erc20aurora: {
    platform: 'ethereum',
    platformKey: 'aurora',
    standard: 'erc20aurora',
    value: 'erc20aurora',
    currency: 'aureth',
    explorerApi: config.api.aurorascan,
    explorerApiKey: config.api.aurora_ApiKey,
    hasSupportAtomicSwap: false,
  },
  phi20_v1: {
    platform: '',
    platformKey: '',
    standard: 'phi20_v1',
    value: 'phi20_v1',
    currency: 'phi_v1',
    explorerApi: config.api?.aurorascan || '', // ???
    explorerApiKey: config.api?.phi_ApiKey || '', // ???
    hasSupportAtomicSwap: false,
  },
  phi20: {
    platform: '',
    platformKey: '',
    standard: 'phi20',
    value: 'phi20',
    currency: 'phi',
    explorerApi: config.api?.aurorascan || '', // ???
    explorerApiKey: config.api?.phi_ApiKey || '', // ???
    hasSupportAtomicSwap: false,
  },
  fkw20: {
    platform: '',
    platformKey: '',
    standard: 'fkw20',
    value: 'fkw20',
    currency: 'fkw',
    explorerApi: config.api?.fkwscan || '', // ???
    explorerApiKey: config.api?.fkwscan_api || '', // ???
    hasSupportAtomicSwap: false,
  },
  phpx20: {
    platform: '',
    platformKey: '',
    standard: 'phpx20',
    value: 'phpx20',
    currency: 'phpx',
    explorerApi: config.api?.phpxscan || '', // ???
    explorerApiKey: config.api?.phpxscan_api || '', // ???
    hasSupportAtomicSwap: false,
  },
}

export const EXISTING_STANDARDS = Object.values(STANDARDS)
  .filter(({ standard }) => !!config[standard])
  .map(({ standard }) => standard.toLowerCase())

export default STANDARDS
