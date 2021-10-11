import getCoinInfo from 'common/coins/getCoinInfo'
import erc20Like from 'common/erc20Like'
import config from 'helpers/externalConfig'

const allowedCoins = [
  ...(!config.opts.blockchainSwapEnabled || config.opts.blockchainSwapEnabled.btc ? ['BTC'] : []),
  ...(!config.opts.blockchainSwapEnabled || config.opts.blockchainSwapEnabled.ghost ? ['GHOST'] : []),
  ...(!config.opts.blockchainSwapEnabled || config.opts.blockchainSwapEnabled.next ? ['NEXT'] : []),
]

Object.values(config.evmNetworks).forEach((network: { currency: string }) => {
  const { currency } = network

  if (!config.opts.blockchainSwapEnabled || config.opts.blockchainSwapEnabled[currency.toLowerCase()]) {
    allowedCoins.push(currency.toUpperCase())
  }
})

const isExchangeAllowed = (currencies) =>
  currencies.filter((item) => {
    const { value } = item

    console.log('%c isExchangeAllowed','color:brown;font-size:20px')
    console.log('item: ', item)

    if (erc20Like.isToken({ name: value })) {
      const { blockchain } = getCoinInfo(value)

      return (
        !config.opts.blockchainSwapEnabled ||
        config.opts.blockchainSwapEnabled[blockchain.toLowerCase()]
      )
    }

    return allowedCoins.map((name) => name.toLowerCase()).includes(value.toLowerCase())
  })

const filterIsPartial = (orders) =>
  orders
    .filter((order) => order.isPartial && !order.isProcessing && !order.isHidden)
    .filter((order) => order.sellAmount !== 0 && order.sellAmount.isGreaterThan(0)) // WTF sellAmount can be not BigNumber
    .filter((order) => order.buyAmount !== 0 && order.buyAmount.isGreaterThan(0)) // WTF buyAmount can be not BigNumber too - need fix this

export default {
  isExchangeAllowed,
  filterIsPartial,
}