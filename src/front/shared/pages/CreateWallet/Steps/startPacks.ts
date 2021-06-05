import config from 'helpers/externalConfig'
const curEnabled = config.opts.curEnabled

// TODO: Move it in a better place

export const defaultPack = [
  ...(!curEnabled || curEnabled.btc ? [{ name: 'BTC', capture: 'Bitcoin' }] : []),

  ...(!curEnabled || curEnabled.eth ? [{ name: 'ETH', capture: 'Ethereum' }] : []),
  ...(config.erc20 ? [{ name: 'ERC20', capture: 'Token', baseChain: 'ETH' }] : []),

  ...(!curEnabled || curEnabled.bnb ? [{ name: 'BNB', capture: 'Binance Coin' }] : []),
  ...(config.bep20 ? [{ name: 'BEP20', capture: 'Token', baseChain: 'BSC' }] : []),

  ...(!curEnabled || curEnabled.ghost ? [{ name: 'GHOST', capture: 'Ghost' }] : []),
  ...(!curEnabled || curEnabled.next ? [{ name: 'NEXT', capture: 'NEXT.coin' }] : []),

  ...(config.bep20 ? [{ name: 'BTCB', capture: 'BTCB Token', baseChain: 'BSC' }] : []),
  ...(config.erc20
    ? [
        { name: 'WBTC', capture: 'Wrapped Bitcoin', baseChain: 'ETH' },
        { name: 'USDT', capture: 'Tether', baseChain: 'ETH' },
        { name: 'EURS', capture: 'Eurs', baseChain: 'ETH' },
      ]
    : []),
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
  ...(!curEnabled || curEnabled.ghost ? [{ name: 'GHOST', capture: 'Ghost' }] : []),
  ...(!curEnabled || curEnabled.next ? [{ name: 'NEXT', capture: 'NEXT.coin' }] : []),
]
