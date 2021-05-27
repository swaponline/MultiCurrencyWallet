import config from 'helpers/externalConfig'

const NETWORK = process.env.MAINNET ? 'mainnet' : 'testnet'

const getCustomTokenConfig = () => {
  //@ts-ignore: strictNullChecks
  let tokensInfo = JSON.parse(localStorage.getItem('customToken'))
  if (!tokensInfo || !tokensInfo[NETWORK]) return {}
  return tokensInfo[NETWORK]
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


if (config?.isWidget) {
  swap.length = 0

  if (window?.widgetERC20Tokens?.length) {
    window.widgetERC20Tokens.forEach((token) => {
      const name = token.name.toUpperCase()

      swap.push(`${name}-BTC`)
      if (!config.opts.curEnabled || config.opts.curEnabled.ghost) swap.push(`${name}-GHOST`)
      if (!config.opts.curEnabled || config.opts.curEnabled.next) swap.push(`${name}-NEXT`)
    })
  } else {
    swap.push(`${config.erc20token.toUpperCase()}-BTC`)
  }
  swap.push('ETH-BTC')
  if (!config.opts.curEnabled || config.opts.curEnabled.ghost) swap.push('ETH-GHOST')
  if (!config.opts.curEnabled || config.opts.curEnabled.next) swap.push('ETH-NEXT')
} else {
  const customTokenConfig = getCustomTokenConfig()

  Object.keys(customTokenConfig).forEach((standard) => {
    Object.keys(customTokenConfig[standard]).forEach((tokenContractAddr) => {
      const tokenObj = customTokenConfig[standard][tokenContractAddr]
      const { symbol } = tokenObj
      const pair = `${symbol.toUpperCase()}-BTC`
  
      if (!swap.includes(pair)) {
        swap.push(pair)
      }
  
      if (!config.opts.curEnabled || config.opts.curEnabled.ghost) {
        const ghostPair = `${symbol.toUpperCase()}-GHOST`

        if (!swap.includes(ghostPair)) {
          swap.push(ghostPair)
        }
      }
  
      if (!config.opts.curEnabled || config.opts.curEnabled.next) {
        const nextPair = `${symbol.toUpperCase()}-NEXT`

        if (!swap.includes(nextPair)) {
          swap.push(nextPair)
        }
      }
    })
  })
}

export default [
  ...swap,
]
