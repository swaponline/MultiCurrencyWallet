import config from 'app-config'


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
    'ETH-BTC',
    'ETH-LTC',
    'LTC-BTC',
    'ETH-BCH',
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
    swap.push(`${symbol.toUpperCase()}-BTC`)
  })
}
export default [
  ...swap,
]
