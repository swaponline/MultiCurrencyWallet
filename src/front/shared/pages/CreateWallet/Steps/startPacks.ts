import config from 'helpers/externalConfig'
const curEnabled = config.opts.curEnabled

// TODO: Move it in a better place

export const defaultPack = [
  ...(!curEnabled || curEnabled.btc ? [{ name: 'BTC', capture: 'Bitcoin' }] : []),

  ...(!curEnabled || curEnabled.eth ? [{ name: 'ETH', capture: 'Ethereum' }] : []),
  ...(config.erc20 ? [{ name: '{ETH}ERC20', capture: 'Token' }] : []),

  ...(!curEnabled || curEnabled.bnb ? [{ name: 'BNB', capture: 'Binance Coin' }] : []),
  ...(config.bep20 ? [{ name: '{BSC}BEP20', capture: 'Token' }] : []),

  ...(!curEnabled || curEnabled.matic ? [{ name: 'MATIC', capture: 'MATIC Token' }] : []),

  ...(!curEnabled || curEnabled.ghost ? [{ name: 'GHOST', capture: 'Ghost' }] : []),
  ...(!curEnabled || curEnabled.next ? [{ name: 'NEXT', capture: 'NEXT.coin' }] : []),

  ...(config.bep20 ? [{ name: '{BSC}BTCB', capture: 'BTCB Token' }] : []),
  ...(config.erc20
    ? [
        { name: '{ETH}WBTC', capture: 'Wrapped Bitcoin' },
        { name: '{ETH}USDT', capture: 'Tether' },
        { name: '{ETH}EURS', capture: 'Eurs' },
      ]
    : []),
  ...(config.erc20matic ? [{ name: '{MATIC}WBTC', capture: 'WBTC Token' }] : []),
  ...(process.env.MAINNET
    ? [{ name: 'SWAP', capture: 'Swap' }]
    : [{ name: 'WEENUS', capture: 'Weenus' }]),
]

export const widgetPack = [
  ...(!curEnabled || curEnabled.btc ? [{ name: 'BTC', capture: 'Bitcoin' }] : []),
  ...(!curEnabled || curEnabled.eth ? [{ name: 'ETH', capture: 'Ethereum' }] : []),
  ...(config.erc20 ? [{ name: 'ERC20', capture: 'Token', baseChain: 'ETH' }] : []),
  ...(!curEnabled || curEnabled.bnb ? [{ name: 'BNB', capture: 'Binance Coin' }] : []),
  ...(config.bep20 ? [{ name: 'BEP20', capture: 'Token', baseChain: 'BSC' }] : []),
  ...(!curEnabled || curEnabled.matic ? [{ name: 'MATIC', capture: 'MATIC Token' }] : []),
  ...(!curEnabled || curEnabled.ghost ? [{ name: 'GHOST', capture: 'Ghost' }] : []),
  ...(!curEnabled || curEnabled.next ? [{ name: 'NEXT', capture: 'NEXT.coin' }] : []),
]
