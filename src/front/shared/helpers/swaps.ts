import { BigNumber } from 'bignumber.js';
import getCoinInfo from 'common/coins/getCoinInfo'
import erc20Like from 'common/erc20Like'
import externalConfig from 'helpers/externalConfig'

const allowedCoins = [
  ...(!externalConfig.opts.blockchainSwapEnabled || externalConfig.opts.blockchainSwapEnabled.btc ? ['BTC'] : []),
  ...(!externalConfig.opts.blockchainSwapEnabled || externalConfig.opts.blockchainSwapEnabled.ghost ? ['GHOST'] : []),
  ...(!externalConfig.opts.blockchainSwapEnabled || externalConfig.opts.blockchainSwapEnabled.next ? ['NEXT'] : []),
]

Object.values(externalConfig.evmNetworks).forEach((network: { currency: string }) => {
  const { currency } = network

  if (!externalConfig.opts.blockchainSwapEnabled || externalConfig.opts.blockchainSwapEnabled[currency.toLowerCase()]) {
    allowedCoins.push(currency.toUpperCase())
  }
})

const isExchangeAllowed = (currencies) =>
  currencies.filter((item) => {
    const { value } = item

    if (erc20Like.isToken({ name: value })) {
      const { blockchain } = getCoinInfo(value)

      return (
        !externalConfig.opts.blockchainSwapEnabled ||
        externalConfig.opts.blockchainSwapEnabled[blockchain.toLowerCase()]
      )
    }

    return allowedCoins.map((name) => name.toLowerCase()).includes(value.toLowerCase())
  })

const filterOrders = (orders) => {
  return orders
    .filter((order) => order.isPartial && !order.isProcessing && !order.isHidden)
    .filter((order) => {
      const sellAmount = new BigNumber(order.sellAmount)
      const buyAmount = new BigNumber(order.buyAmount)

      return (
        !sellAmount.isEqualTo(0) &&
        sellAmount.isGreaterThan(0) &&
        !buyAmount.isEqualTo(0) &&
        buyAmount.isGreaterThan(0)
      )
    })
  }

export default {
  isExchangeAllowed,
  filterOrders,
}