import {
  COIN_DATA,
  COIN_MODEL,
  COIN_TYPE,
} from 'swap.app/constants/COINS'
import { BigNumber } from 'bignumber.js'
import helpers from 'helpers'


const feeCache = {}

const fetchCoinFee = (coin) => {
  return new Promise(async (feeResolved) => {
    if (feeCache[coin]) {
      feeResolved(feeCache[coin])
      return
    }

    const coinData = COIN_DATA[coin]

    let coinFeeData = false
    let dontCache = false

    const doResolve = (coinFeeData) => {
      if (!dontCache && coinFeeData) {
        feeCache[coin] = coinFeeData
      }
      feeResolved(coinFeeData)
    }

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
              doResolve({
                coin: coinData.ticker,
                fee: new BigNumber(coinFee).toNumber(),
                isUTXO: (coinData.model === COIN_MODEL.UTXO),
              })
            }).catch((err) => {
              console.error(`Fail fetch fee for coin ${coinData.ticker}`, err)
              dontCache = true
              doResolve({
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
            speed: 'fast',
          }).then((ethFee) => {
            doResolve({
              coin: `ETH`,
              fee: new BigNumber(ethFee).toNumber(),
              isUTXO: false,
            })
          }).catch((err) => {
            console.error(`Fail fetch fee for coin ${coinData.ticker} (ETH)`, err)
            dontCache = true
            coin = `ETH`
            doResolve({
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
    const sell = await fetchCoinFee(sellCoin.toUpperCase())
    const buy = await fetchCoinFee(buyCoin.toUpperCase())

    const byCoins = {}
    //@ts-ignore: Property 'coin' does not exist on type 'unknown'
    byCoins[buy.coin] = buy
    //@ts-ignore: Property 'coin' does not exist on type 'unknown'
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