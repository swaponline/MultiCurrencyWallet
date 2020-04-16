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
    ...(!config.opts.curEnabled || (config.opts.curEnabled.etc && config.opts.curEnabled.bch)) ? ['ETH-BCH'] : [],
  ]

Object.keys(config.erc20)
  .forEach(key => {
    swap.push(`${key.toUpperCase()}-BTC`)

    // swap.push(`${key.toUpperCase()}-USDTomni`)
  })


if (config && config.isWidget) {
  swap.length = 0
  if (window.widgetERC20Tokens && Object.keys(window.widgetERC20Tokens).length) {
    Object.keys(window.widgetERC20Tokens).forEach((key) => {
      swap.push(`${key.toUpperCase()}-BTC`)
    })
  } else {
    swap.push(`${config.erc20token.toUpperCase()}-BTC`)
  }
  // swap.push(`${config.erc20token.toUpperCase()}-USDTomni`)
  swap.push('ETH-BTC')
} else {
  const customERC = GetCustromERC20()
  Object.keys(customERC).forEach((tokenContract) => {
    const symbol = customERC[tokenContract].symbol
    const pair = `${symbol.toUpperCase()}-BTC`

    if (swap.indexOf(pair) === -1) swap.push(pair)
  })
}
export default [
  ...swap,
]
