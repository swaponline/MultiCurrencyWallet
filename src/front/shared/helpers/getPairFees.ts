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
  const { coinName, fixed } = args

  return new Promise(async (feeResolved) => {
    if (feeCache[coinName]) {
      feeResolved(feeCache[coinName])
      return
    }

    const coinData = COIN_DATA[coinName]
    let dontCache = false

    const doResolve = (coinFeeData) => {
      if (!dontCache && coinFeeData) {
        feeCache[coinName] = coinFeeData
      }
      feeResolved(coinFeeData)
    }

    if (coinData) {
      switch (coinData.type) {
        case COIN_TYPE.NATIVE:
          if (
            helpers[coinData.ticker.toLowerCase()]
            && helpers[coinData.ticker.toLowerCase()].estimateFeeValue
            && typeof helpers[coinData.ticker.toLowerCase()].estimateFeeValue === `function`
          ) {
            helpers[coinData.ticker.toLowerCase()].estimateFeeValue({ method: 'swap', fixed })
              .then((coinFee) => doResolve({
                coin: coinData.ticker,
                fee: coinFee,
                isUTXO: (coinData.model === COIN_MODEL.UTXO),
              }))
              .catch((err) => {
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
          helpers.eth.estimateFeeValue({ method: 'swap', speed: 'fast' })
            .then((ethFee) => doResolve({
              coin: `ETH`,
              fee: ethFee,
              isUTXO: false,
            }))
            .catch((err) => {
              console.error(`Fail fetch fee for coin ${coinData.ticker} (ETH)`, err)
              dontCache = true
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
      console.warn(`Helpers > fetchCoinFee - Unknown coin (${coinName})`)
    }
  })
}

export const getPairFees = (args): Promise<PairFees> => {
  const { sellCurrency, buyCurrency } = args
  const sellCurrencyUp = sellCurrency.toUpperCase()
  const buyCurrencyUp = buyCurrency.toUpperCase()
  // for currency with UTXO model that we buy
  // we use default tx size (one input)
  const coinIsBought = COIN_DATA[buyCurrencyUp].model === COIN_MODEL.UTXO
    && buyCurrencyUp === 'BTC'

  return new Promise(async (feeResolved) => {
    const sell = await fetchCoinFee({
      coinName: sellCurrencyUp,
    })
    const buy = await fetchCoinFee({
      coinName: buyCurrencyUp,
      fixed: coinIsBought,
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
