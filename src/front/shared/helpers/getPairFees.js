import {
  COIN_DATA,
  COIN_MODEL,
  COIN_TYPE,
} from 'swap.app/constants/COINS'
import { BigNumber } from 'bignumber.js'
import helpers from 'helpers'


const fetchCoinFee = (coin) => {
  return new Promise(async (feeResolved) => {
    const coinData = COIN_DATA[coin.toUpperCase()]
    if (coinData) {
      switch (coinData.type) {
        case COIN_TYPE.NATIVE:
          if (helpers[coinData.ticker.toLowerCase()]
            && helpers[coinData.ticker.toLowerCase()].estimateFeeValue
            && typeof helpers[coinData.ticker.toLowerCase()].estimateFeeValue === `function`
          ) {
            helpers[coinData.ticker.toLowerCase()].estimateFeeValue({
              method: 'swap',
            }).then((coinFee) => {
              feeResolved({
                coin: coinData.ticker,
                fee: BigNumber(coinFee).toNumber(),
                isUTXO: (coinData.model === COIN_MODEL.UTXO),
              })
            }).catch((err) => {
              console.error(`Fail fetch fee for coin ${coinData.ticker}`, err)
              feeResolved({
                coin: coinData.ticker,
                fee: 0,
                isUTXO: (coinData.model === COIN_MODEL.UTXO),
              })
            })
          } else {
            console.warn(`No helper 'estimateFeeValue' for coin ${coinData.ticker}`)
          }
          break;
        case COIN_TYPE.ETH_TOKEN:
          helpers.eth.estimateFeeValue({
            method: 'swap',
          }).then((ethFee) => {
            feeResolved({
              coin: `ETH`,
              fee: BigNumber(ethFee).toNumber(),
              isUTXO: false,
            })
          }).catch((err) => {
            console.error(`Fail fetch fee for coin ${coinData.ticker} (ETH)`, err)
            feeResolved({
              coin: `ETH`,
              fee: 0,
              isUTXO: false,
            })
          })
          break;
        default:
          console.warn(`Unknown coin type ${coinData.type} for coin ${coinData.ticker}`)
          break;
      }
    } else {
      console.warn(`getPairFees->fetchCoinFee - Unknown coin ${coin.toUpperCase()}`)
    }
  })
}

export const getPairFees = (sellCoin, buyCoin) => {
  return new Promise(async (feeResolved) => {
    const sell = await fetchCoinFee(sellCoin)
    const buy = await fetchCoinFee(buyCoin)

    const byCoins = {}
    byCoins[buy.coin] = buy
    byCoins[sell.coin] = sell

    feeResolved({
      sell,
      have: sell,
      buy,
      get: buy,
      byCoins,
    })
  })
}