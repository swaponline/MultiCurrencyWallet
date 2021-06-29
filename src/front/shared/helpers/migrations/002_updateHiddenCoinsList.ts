import { localStorage, constants } from 'helpers'
import { COIN_DATA, COIN_TYPE } from 'swap.app/constants/COINS'
import getCoinInfo from 'common/coins/getCoinInfo'

const storageKey = constants.localStorage.hiddenCoinsList


const name = 'Update hiddenCoinsList - add baseCurrency to tokens'
const run = () => {
  const hiddenCoinsList = localStorage.getItem(storageKey) || '[]'

  const updatedHiddenCoinsList = hiddenCoinsList.map(coin => {
    let currency = coin.toUpperCase()

    if (coin.includes(':')) {
      const [coinName, coinAddress] = coin.split(':')
      currency = coinName.toUpperCase()
    }

    switch (currency.toLowerCase()) {
      case 'btc (multisig)':
      case 'btc (sms-protected)':
      case 'btc (pin-protected)':
        currency = 'BTC'
        break
    }

    if (COIN_DATA[currency]?.type === COIN_TYPE.NATIVE) {
      return coin
    }

    const TokenData = COIN_DATA[currency]

    const {
      coin: tokenName,
      blockchain: tokenBlockchain
    } = getCoinInfo(currency)

    return tokenBlockchain ? coin : `{${ TokenData?.blockchain || 'ETH'}}${coin}`
  })

  localStorage.setItem(storageKey, updatedHiddenCoinsList)
  return Promise.resolve()
}

export default {
  name,
  run,
}