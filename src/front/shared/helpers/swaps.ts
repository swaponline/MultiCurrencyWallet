import config from 'helpers/externalConfig'

const allowedCoins = [
  ...(!config.opts.blockchainSwapEnabled || config.opts.blockchainSwapEnabled.btc ? ['BTC'] : []),
  ...(!config.opts.blockchainSwapEnabled || config.opts.blockchainSwapEnabled.eth ? ['ETH'] : []),
  ...(!config.opts.blockchainSwapEnabled || config.opts.blockchainSwapEnabled.bnb ? ['BNB'] : []),
  ...(!config.opts.blockchainSwapEnabled || config.opts.blockchainSwapEnabled.matic ? ['MATIC'] : []),
  ...(!config.opts.blockchainSwapEnabled || config.opts.blockchainSwapEnabled.arbeth ? ['ARBETH'] : []),
  ...(!config.opts.blockchainSwapEnabled || config.opts.blockchainSwapEnabled.ghost ? ['GHOST'] : []),
  ...(!config.opts.blockchainSwapEnabled || config.opts.blockchainSwapEnabled.next ? ['NEXT'] : []),
]

const isExchangeAllowed = (currencies) =>
  currencies.filter((c) => {
    const isErc = Object.keys(config.erc20)
      .map((i) => `{eth}${i.toLowerCase()}`)
      .includes(`${c.value}`.toLowerCase())
    const isBep = Object.keys(config.bep20)
      .map((i) => `{bnb}${i.toLowerCase()}`)
      .includes(`${c.value}`.toLowerCase())
    const isErcMatic = Object.keys(config.erc20matic)
      .map((i) => `{matic}${i.toLowerCase()}`)
      .includes(`${c.value}`.toLowerCase())

    const isAllowedCoin = allowedCoins.map((i) => i.toLowerCase()).includes(c.value.toLowerCase())

    return isAllowedCoin || isErc || isBep || isErcMatic
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