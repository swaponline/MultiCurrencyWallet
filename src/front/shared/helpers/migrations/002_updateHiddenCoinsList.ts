import { localStorage, constants } from 'helpers'
import { COIN_DATA, COIN_TYPE } from 'swap.app/constants/COINS'
import getCoinInfo from 'common/coins/getCoinInfo'

const storageKey = constants.localStorage.hiddenCoinsList


const name = 'Update hiddenCoinsList - add baseCurrency to tokens'
const run = () => {
  const isWalletCreated = localStorage.getItem(constants.localStorage.isWalletCreate)

  // if it's a new user, then do nothing (he already has a new token list)
  if (!isWalletCreated) {
    return Promise.resolve()
  }

  const hiddenCoinsList = localStorage.getItem(storageKey) || '[]'

  const similarTokens: {
    ticker: string
    name: string
    type: string
    blockchain: string
    model: string
    precision: number
    standard?: string
  }[] = []

  const hiddenNativeCoinsList = hiddenCoinsList.filter(coin => {
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

    if (COIN_DATA[currency]?.type === COIN_TYPE.NATIVE) return true

    const {
      coin: tokenName
    } = getCoinInfo(currency)

    Object.keys(COIN_DATA).map(tokenKey => {
      const tokenInfo = getCoinInfo(tokenKey)
      if (tokenInfo.coin === tokenName) {
        similarTokens.push(COIN_DATA[tokenKey])
      }
    })

    return false
  })

  const hiddenTokensList: string[] = []

  similarTokens.forEach(token => {
    const baseCurrency = token.blockchain
    const ticker = token.ticker
    const tokenValue = `{${baseCurrency}}${ticker}`

    !hiddenTokensList.includes(tokenValue) && hiddenTokensList.push(tokenValue)
  })

  const updatedHiddenCoinsList = [...hiddenNativeCoinsList, ...hiddenTokensList]

  localStorage.setItem(storageKey, updatedHiddenCoinsList)

  localStorage.setItem('shouldUpdatePageAfterMigration', true)
  return Promise.resolve()
}

export default {
  name,
  run,
}