import {
  COIN_DATA,
  COIN_MODEL,
  COIN_TYPE,
} from 'swap.app/constants/COINS'
import { BigNumber } from 'bignumber.js'
import helpers from 'helpers'

type CoinFee = {
  coin: string
  fee: number
  isUTXO: boolean
}

type PairFees = {
  sell: CoinFee
  buy: CoinFee
  have: CoinFee
  get: CoinFee
  byCoins: {
    [key: string]: CoinFee
  }
}

const feeCache = {}

const fetchCoinFee = (args): Promise<CoinFee> => {
  const { coinName } = args
  let coin = coinName

  return new Promise(async (feeResolved) => {
    if (feeCache[coin]) {
      feeResolved(feeCache[coin])
      return
    }

    const coinData = COIN_DATA[coin]
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
          console.warn(`Unknown coin type (${coinData.type}) for coin (${coinData.ticker})`)
          break;
      }
    } else {
      console.warn(`Helpers > fetchCoinFee - Unknown coin (${coin})`)
    }
  })
}

export const getPairFees = (args): Promise<PairFees> => {
  const { sellCurrency, buyCurrency } = args

  return new Promise(async (feeResolved) => {
    const sell = await fetchCoinFee({
      coinName: sellCurrency.toUpperCase(),
    })
    const buy = await fetchCoinFee({
      coinName: buyCurrency.toUpperCase(),
    })
    
    const byCoins = {
      [buy.coin]: buy,
      [sell.coin]: sell
    }

    feeResolved({
      sell,
      have: sell,
      buy,
      get: buy,
      byCoins,
    })
  })
}