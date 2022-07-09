import config from 'helpers/externalConfig'

const { curEnabled } = config.opts
const onlyEvmWallets = !!(config?.opts?.ui?.disableInternalWallet)

export const defaultPack = [
  ...((!curEnabled || curEnabled.btc) && !onlyEvmWallets ? [{ name: 'BTC', capture: 'Bitcoin' }] : []),

  ...(!curEnabled || curEnabled.eth ? [{ name: 'ETH', capture: 'Ethereum' }] : []),

  ...(!curEnabled || curEnabled.bnb ? [{ name: 'BNB', capture: 'Binance Coin' }] : []),

  ...(!curEnabled || curEnabled.matic ? [{ name: 'MATIC', capture: 'MATIC Token' }] : []),

  ...(!curEnabled || curEnabled.arbeth ? [{ name: 'ARBETH', capture: 'Arbitrum ETH' }] : []),

  ...(!curEnabled || curEnabled.xdai ? [{ name: 'XDAI', capture: 'xDai' }] : []),

  ...(!curEnabled || curEnabled.ftm ? [{ name: 'FTM', capture: 'Fantom' }] : []),

  ...(!curEnabled || curEnabled.avax ? [{ name: 'AVAX', capture: 'Avalanche' }] : []),

  ...(!curEnabled || curEnabled.movr ? [{ name: 'MOVR', capture: 'Moonriver' }] : []),

  ...(!curEnabled || curEnabled.one ? [{ name: 'ONE', capture: 'Harmony' }] : []),

  ...(!curEnabled || curEnabled.ame ? [{ name: 'AME', capture: 'AME Chain' }] : []),

  ...(!curEnabled || curEnabled.aureth ? [{ name: 'AURETH', capture: 'Aurora ETH' }] : []),

  ...(!curEnabled || curEnabled.phi ? [{ name: 'PHI', capture: 'PHI' }] : []),

  ...((!curEnabled || curEnabled.ghost) && !onlyEvmWallets ? [{ name: 'GHOST', capture: 'Ghost' }] : []),
  ...((!curEnabled || curEnabled.next) && !onlyEvmWallets ? [{ name: 'NEXT', capture: 'NEXT.coin' }] : []),

  ...(config.bep20 ? [{ name: 'BTCB', capture: 'BTCB Token', baseCurrency: 'BNB' }] : []),
  ...(config.erc20
    ? [
      { name: 'WBTC', capture: 'Wrapped Bitcoin', baseCurrency: 'ETH' },
      { name: 'USDT', capture: 'Tether', baseCurrency: 'ETH' },
      { name: 'EURS', capture: 'Eurs', baseCurrency: 'ETH' },
    ]
    : []),
  ...(config.erc20matic ? [{ name: 'WBTC', capture: 'WBTC Token', baseCurrency: 'MATIC' }] : []),
  ...(process.env.MAINNET
    ? [{ name: 'SWAP', capture: 'Swap', baseCurrency: 'ETH' }]
    : [{ name: 'WEENUS', capture: 'Weenus', baseCurrency: 'ETH' }]),
  ...(config.erc20 ? [{ name: 'ERC20', capture: 'Token', baseCurrency: 'ETH' }] : []),
  ...(config.bep20 ? [{ name: 'BEP20', capture: 'Token', baseCurrency: 'BNB' }] : []),
  ...(config.erc20matic ? [{ name: 'ERC20MATIC', capture: 'Token', baseCurrency: 'MATIC' }] : []),
  ...(config.erc20xdai ? [{ name: 'ERC20XDAI', capture: 'Token', baseCurrency: 'XDAI' }] : []),
  ...(config.erc20ftm ? [{ name: 'ERC20FTM', capture: 'Token', baseCurrency: 'FTM' }] : []),
  ...(config.erc20avax ? [{ name: 'ERC20AVAX', capture: 'Token', baseCurrency: 'AVAX' }] : []),
  ...(config.erc20movr ? [{ name: 'ERC20MOVR', capture: 'Token', baseCurrency: 'MOVR' }] : []),
  ...(config.erc20one ? [{ name: 'ERC20ONE', capture: 'Token', baseCurrency: 'ONE' }] : []),
  ...(config.erc20ame ? [{ name: 'ERC20AME', capture: 'Token', baseCurrency: 'AME' }] : []),
  ...(config.erc20aurora ? [{ name: 'ERC20AURORA', capture: 'Token', baseCurrency: 'AURETH' }] : []),
  ...(config.phi20 ? [{ name: 'PHI20', capture: 'Token', baseCurrency: 'PHI' }] : []),
]

export const widgetPack = [
  ...((!curEnabled || curEnabled.btc) && !onlyEvmWallets ? [{ name: 'BTC', capture: 'Bitcoin' }] : []),
  ...(!curEnabled || curEnabled.eth ? [{ name: 'ETH', capture: 'Ethereum' }] : []),
  ...((config.erc20 && (!curEnabled || curEnabled.eth)) ? [{ name: 'ERC20', capture: 'Token', baseCurrency: 'ETH' }] : []),
  ...(!curEnabled || curEnabled.bnb ? [{ name: 'BNB', capture: 'Binance Coin' }] : []),
  ...((config.bep20 && (!curEnabled || curEnabled.bnb)) ? [{ name: 'BEP20', capture: 'Token', baseCurrency: 'BNB' }] : []),
  ...(!curEnabled || curEnabled.matic ? [{ name: 'MATIC', capture: 'MATIC Token' }] : []),
  ...((config.erc20matic && (!curEnabled || curEnabled.matic)) ? [{ name: 'ERC20MATIC', capture: 'Token', baseCurrency: 'MATIC' }] : []),
  ...(!curEnabled || curEnabled.arbeth ? [{ name: 'ARBETH', capture: 'Arbitrum ETH' }] : []),
  ...(!curEnabled || curEnabled.xdai ? [{ name: 'XDAI', capture: 'xDai' }] : []),
  ...((config.erc20xdai && (!curEnabled || curEnabled.xdai)) ? [{ name: 'ERC20XDAI', capture: 'Token', baseCurrency: 'XDAI' }] : []),
  ...(!curEnabled || curEnabled.ftm ? [{ name: 'FTM', capture: 'Fantom' }] : []),
  ...((config.erc20ftm && (!curEnabled || curEnabled.ftm)) ? [{ name: 'ERC20FTM', capture: 'Token', baseCurrency: 'FTM' }] : []),
  ...(!curEnabled || curEnabled.avax ? [{ name: 'AVAX', capture: 'Avalanche' }] : []),
  ...((config.erc20avax && (!curEnabled || curEnabled.avax)) ? [{ name: 'ERC20AVAX', capture: 'Token', baseCurrency: 'AVAX' }] : []),
  ...(!curEnabled || curEnabled.movr ? [{ name: 'MOVR', capture: 'Moonriver' }] : []),
  ...((config.erc20movr && (!curEnabled || curEnabled.movr)) ? [{ name: 'ERC20MOVR', capture: 'Token', baseCurrency: 'MOVR' }] : []),
  ...(!curEnabled || curEnabled.one ? [{ name: 'ONE', capture: 'Harmony One' }] : []),
  ...((config.erc20one && (!curEnabled || curEnabled.one)) ? [{ name: 'ERC20ONE', capture: 'Token', baseCurrency: 'ONE' }] : []),
  ...(!curEnabled || curEnabled.ame ? [{ name: 'AME', capture: 'AME Chain' }] : []),
  ...((config.erc20ame && (!curEnabled || curEnabled.ame)) ? [{ name: 'ERC20AME', capture: 'Token', baseCurrency: 'AME' }] : []),
  ...(!curEnabled || curEnabled.aureth ? [{ name: 'AURETH', capture: 'Aurora ETH' }] : []),
  ...((config.erc20aurora && (!curEnabled || curEnabled.aureth)) ? [{ name: 'ERC20AURORA', capture: 'Token', baseCurrency: 'AURETH' }] : []),
  ...(!curEnabled || curEnabled.phi ? [{ name: 'PHI', capture: 'PHI' }] : []),
  ...((config.phi20 && (!curEnabled || curEnabled.phi)) ? [{ name: 'PHI20', capture: 'Token', baseCurrency: 'PHI' }] : []),
  ...((!curEnabled || curEnabled.ghost) && !onlyEvmWallets ? [{ name: 'GHOST', capture: 'Ghost' }] : []),
  ...((!curEnabled || curEnabled.next) && !onlyEvmWallets ? [{ name: 'NEXT', capture: 'NEXT.coin' }] : []),
]
