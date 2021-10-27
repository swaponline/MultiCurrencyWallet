import { BASE_TOKEN_CURRENCY } from 'swap.app/constants/COINS'

const getCoinInfo = (coin) => {
  coin = `${coin}`.toUpperCase()

  if (coin.indexOf(`}`) !== -1 && coin.indexOf(`{`) === 0) {
    let coinData = coin.split(`}`)
    return {
      coin: coinData[1],
      blockchain: BASE_TOKEN_CURRENCY[coinData[0].substr(1).toUpperCase()] || ``,
    }
  } else {
    return {
      coin,
      blockchain: ``,
    }
  }
}

export default getCoinInfo