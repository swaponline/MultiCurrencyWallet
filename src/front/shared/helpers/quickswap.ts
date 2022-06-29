import { COIN_MODEL, COIN_DATA } from 'swap.app/constants/COINS'
import getCoinInfo from 'common/coins/getCoinInfo'
import { externalConfig, metamask } from 'helpers'

const isWrongNetwork = (chainIds: number[]) => {
  if (metamask.isConnected()) {
    return !chainIds.includes(metamask.getChainId())
  }

  return false
}

const filterCurrencies = (params) => {
  const { currencies, onlyTokens = false } = params

  const filteredArr = currencies.filter((item) => {
    const currency = COIN_DATA[item.name]
    let isCurrencySuitable = false
    let itemChainId

    if (item.standard) {
      const { blockchain } = getCoinInfo(item.value)

      if (blockchain) {
        itemChainId = externalConfig.evmNetworks[blockchain.toUpperCase()].networkVersion
      }
    } else {
      itemChainId =
        currency?.model === COIN_MODEL.AB &&
        externalConfig.evmNetworks[currency.ticker].networkVersion
    }

    const enabled = externalConfig.enabledEvmNetworkVersions.includes(itemChainId)
    isCurrencySuitable = enabled && (item.standard || !onlyTokens)

    // connected metamask allows only one chain
    const suitableForExternalWallet = metamask.isConnected()
      ? metamask.isAvailableNetworkByCurrency(item.value)
      : true

    return isCurrencySuitable && suitableForExternalWallet
  })

  return {
    currencies: filteredArr,
    wrongNetwork: isWrongNetwork(externalConfig.enabledEvmNetworkVersions),
  }
}

export default {
  isWrongNetwork,
  filterCurrencies,
}
