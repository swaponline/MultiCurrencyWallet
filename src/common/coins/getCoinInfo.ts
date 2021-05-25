const getCoinInfo = (coin) => {
  coin = coin.toUpperCase()

  if (coin.indexOf(`}`) !== -1 && coin.indexOf(`{`) === 0) {
    let coinData = coin.split(`}`)
    return {
      coin: coinData[1],
      blockchain: coinData[0].substr(1),
    }
  } else {
    return {
      coin,
      blockchain: ``,
    }
  }
}

export default getCoinInfo