import config from 'helpers/externalConfig'


const GetCustromERC20 = () => {
  const configStorage = (process.env.MAINNET) ? 'mainnet' : 'testnet'

  let tokensInfo = JSON.parse(localStorage.getItem('customERC'))
  if (!tokensInfo || !tokensInfo[configStorage]) return {}
  return tokensInfo[configStorage]
}

const swap = (config && config.isWidget) ?
  []
  :
  [
    ...(!config.opts.curEnabled || (config.opts.curEnabled.eth && config.opts.curEnabled.btc)) ? ['ETH-BTC'] : [],
    ...(!config.opts.curEnabled || (config.opts.curEnabled.eth && config.opts.curEnabled.ghost)) ? ['ETH-GHOST'] : [],
    ...(!config.opts.curEnabled || (config.opts.curEnabled.eth && config.opts.curEnabled.next)) ? ['ETH-NEXT'] : [],
  ]

Object.keys(config.erc20)
  .forEach(key => {
    swap.push(`${key.toUpperCase()}-BTC`)
    if (!config.opts.curEnabled || config.opts.curEnabled.ghost) swap.push(`${key.toUpperCase()}-GHOST`)
    if (!config.opts.curEnabled || config.opts.curEnabled.next) swap.push(`${key.toUpperCase()}-NEXT`)
  })


if (config && config.isWidget) {
  swap.length = 0
  if (window.widgetERC20Tokens && Object.keys(window.widgetERC20Tokens).length) {
    Object.keys(window.widgetERC20Tokens).forEach((key) => {
      swap.push(`${key.toUpperCase()}-BTC`)
      if (!config.opts.curEnabled || config.opts.curEnabled.ghost) swap.push(`${key.toUpperCase()}-GHOST`)
      if (!config.opts.curEnabled || config.opts.curEnabled.next) swap.push(`${key.toUpperCase()}-NEXT`)
    })
  } else {
    swap.push(`${config.erc20token.toUpperCase()}-BTC`)
  }
  swap.push('ETH-BTC')
  if (!config.opts.curEnabled || config.opts.curEnabled.ghost) swap.push('ETH-GHOST')
  if (!config.opts.curEnabled || config.opts.curEnabled.next) swap.push('ETH-NEXT')
} else {
  const customERC = GetCustromERC20()
  // swap.push('GHOST-BTC')
  // swap.push('GHOST-ETH')
  Object.keys(customERC).forEach((tokenContract) => {
    const symbol = customERC[tokenContract].symbol
    const pair = `${symbol.toUpperCase()}-BTC`

    if (swap.indexOf(pair) === -1) swap.push(pair)

    if (!config.opts.curEnabled || config.opts.curEnabled.ghost) {
      const ghostPair = `${symbol.toUpperCase()}-GHOST`
      if (swap.indexOf(ghostPair) === -1) swap.push(ghostPair)
    }

    if (!config.opts.curEnabled || config.opts.curEnabled.next) {
      const nextPair = `${symbol.toUpperCase()}-NEXT`
      if (swap.indexOf(nextPair) === -1) swap.push(nextPair)
    }
  })
}
export default [
  ...swap,
]
