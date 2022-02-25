import config from 'helpers/externalConfig'
import TOKEN_STANDARDS from 'helpers/constants/TOKEN_STANDARDS'
const NETWORK = process.env.MAINNET ? 'mainnet' : 'testnet'

const getCustomTokenConfig = () => {
  //@ts-ignore: strictNullChecks
  let tokensInfo = JSON.parse(localStorage.getItem('customToken'))
  if (!tokensInfo || !tokensInfo[NETWORK]) return {}
  return tokensInfo[NETWORK]
}

let buildOpts = {
  curEnabled: false,
  blockchainSwapEnabled: false,
  ownTokens: false,
  addCustomTokens: true,
  invoiceEnabled: true,
}

if (window
  && window.buildOptions
  && Object.keys(window.buildOptions)
  && Object.keys(window.buildOptions).length
) {
  buildOpts = { ...buildOpts, ...window.buildOptions }
}

const swap = (config && config.isWidget) ?
  []
  :
  [
    ...(!config.opts.curEnabled || (config.opts.curEnabled.eth && config.opts.curEnabled.btc)) ? ['ETH-BTC'] : [],
    ...(!config.opts.curEnabled || (config.opts.curEnabled.bnb && config.opts.curEnabled.btc)) ? ['BNB-BTC'] : [],
    ...(!config.opts.curEnabled || (config.opts.curEnabled.matic && config.opts.curEnabled.btc)) ? ['MATIC-BTC'] : [],
    ...(!config.opts.curEnabled || (config.opts.curEnabled.arbeth && config.opts.curEnabled.btc)) ? ['ARBETH-BTC'] : [],
    ...(!config.opts.curEnabled || (config.opts.curEnabled.eth && config.opts.curEnabled.ghost)) ? ['ETH-GHOST'] : [],
    ...(!config.opts.curEnabled || (config.opts.curEnabled.eth && config.opts.curEnabled.next)) ? ['ETH-NEXT'] : [],
  ]

Object.keys(config.erc20)
  .forEach(key => {
    swap.push(`{ETH}${key.toUpperCase()}-BTC`)
    if (!config.opts.curEnabled || config.opts.curEnabled.ghost) swap.push(`{ETH}${key.toUpperCase()}-GHOST`)
    if (!config.opts.curEnabled || config.opts.curEnabled.next) swap.push(`{ETH}${key.toUpperCase()}-NEXT`)
  })
Object.keys(config.bep20)
  .forEach(key => {
    swap.push(`{BNB}${key.toUpperCase()}-BTC`)
  })

Object.keys(config.erc20matic)
  .forEach(key => {
    swap.push(`{MATIC}${key.toUpperCase()}-BTC`)
  })

if (config?.isWidget) {
  swap.length = 0

  if (window?.widgetEvmLikeTokens?.length) {
    window.widgetEvmLikeTokens.forEach((token) => {
      const { name, standard } = token

      const tokenStandardConfig = TOKEN_STANDARDS[standard]
      if (!tokenStandardConfig?.hasSupportAtomicSwap) return

      const baseCurrency = tokenStandardConfig?.currency
      const tokenKey = `{${baseCurrency.toUpperCase()}}${name.toUpperCase()}`

      swap.push(`${tokenKey}-BTC`)
      if (!config.opts.curEnabled || config.opts.curEnabled.ghost) swap.push(`${tokenKey}-GHOST`)
      if (!config.opts.curEnabled || config.opts.curEnabled.next) swap.push(`${tokenKey}-NEXT`)
    })
  } else {
    swap.push(`${config.erc20token.toUpperCase()}-BTC`)
  }
  swap.push('ETH-BTC')

  if (!config.opts.curEnabled || config.opts.curEnabled.ghost) swap.push('ETH-GHOST')
  if (!config.opts.curEnabled || config.opts.curEnabled.next) swap.push('ETH-NEXT')
}

if (buildOpts.addCustomTokens) {
  const customTokenConfig = getCustomTokenConfig()

  Object.keys(customTokenConfig).forEach((standard) => {

    const tokenStandardConfig = TOKEN_STANDARDS[standard]
    if (!tokenStandardConfig?.hasSupportAtomicSwap) return

    Object.keys(customTokenConfig[standard]).forEach((tokenContractAddr) => {
      const tokenObj = customTokenConfig[standard][tokenContractAddr]
      const { symbol, baseCurrency } = tokenObj
      const tokenKey = `{${baseCurrency.toUpperCase()}}${symbol.toUpperCase()}`
      const pair = `${tokenKey}-BTC`

      if (!swap.includes(pair)) {
        swap.push(pair)
      }

      if (!config.opts.curEnabled || config.opts.curEnabled.ghost) {
        const ghostPair = `${tokenKey}-GHOST`

        if (!swap.includes(ghostPair)) {
          swap.push(ghostPair)
        }
      }

      if (!config.opts.curEnabled || config.opts.curEnabled.next) {
        const nextPair = `${tokenKey}-NEXT`

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
