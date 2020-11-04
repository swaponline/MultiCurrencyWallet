import {
  COIN_DATA,
  COIN_MODEL,
  COIN_TYPE,
} from 'swap.app/constants/COINS'
import { BigNumber } from "bignumber.js"
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
              })
            }).catch((err) => {
              console.error(`Fail fetch fee for coin ${coinData.ticker}`, err)
              feeResolved({
                coin: coinData.ticker,
                fee: 0,
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
            })
          }).catch((err) => {
            console.error(`Fail fetch fee for coin ${coinData.ticker} (ETH)`, err)
            feeResolved({
              coin: `ETH`,
              fee: 0,
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
    console.log('called getPairFees', sellCoin, buyCoin)
    const sell = await fetchCoinFee(sellCoin)
    console.log('sell', sell)
    const buy = await fetchCoinFee(buyCoin)
    console.log('buy', buy)

    feeResolved({
      sell,
      have: sell,
      buy,
      get: buy,
    })
  })
}