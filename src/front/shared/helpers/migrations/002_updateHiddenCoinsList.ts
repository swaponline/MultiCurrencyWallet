import { localStorage, constants } from 'helpers'
import { COIN_DATA, COIN_TYPE } from 'swap.app/constants/COINS'
import getCoinInfo from 'common/coins/getCoinInfo'

const storageKey = constants.localStorage.hiddenCoinsList


const name = 'Update hiddenCoinsList - add baseCurrency to tokens'
const run = () => {
  const hiddenCoinsList = JSON.parse(localStorage.getItem(storageKey) || '[]')

  hiddenCoinsList.forEach(coin => {
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

    if (COIN_DATA[currency].type === COIN_TYPE.NATIVE) {
      return coin
    }

    const {
      coin: tokenName,
      blockchain: baseCurrency
    } = getCoinInfo(currency)

    return baseCurrency ? coin : `{ETH}${coin}`
  })

  localStorage.setItem(storageKey, hiddenCoinsList)
  return Promise.resolve()
}

export default {
  name,
  run,
}