import { COIN_DATA, COIN_MODEL, COIN_TYPE } from 'swap.app/constants/COINS'
import helpers from 'helpers'
import config from 'app-config'



const reportAboutProblem = (params) => {
  const { isError = false, info } = params

  console.group(
    'HELPERS > %c getPairFees.ts',
    `color: ${isError ? 'red' : 'orange'};`
  )
  isError ? console.error(info) : console.warn(info)
  console.groupEnd()
}

type CoinFee = {
  coin: string
  fee: number
  isUTXO: boolean
}

export interface IPairFees {
  sell: CoinFee
  buy: CoinFee
  have: CoinFee
  get: CoinFee
  byCoins: {
    [key: string]: CoinFee
  }
}

const feeCache = {
  isEnabled: true,
}

const fetchCoinFee = (params): Promise<CoinFee> => {
  const { coinName, action, updateCacheValue } = params

  return new Promise(async (feeResolved) => {
    const hasFeeInCache = !updateCacheValue && feeCache[action] && feeCache[action][coinName]
    const coinData = COIN_DATA[coinName]
    let isBuyingUTXO = action === 'buy' && coinData.model === COIN_MODEL.UTXO
    let isBuyingAB = action === 'buy' && coinData.model === COIN_MODEL.AB

    let obtainedResult = undefined

    if (hasFeeInCache) {
      feeResolved(feeCache[action][coinName])
      return
    }
    // first off enable cache for every request
    // but if with currency something wrong
    // we disable this
    feeCache.isEnabled = true

    const doResolve = (result) => {
      if (feeCache.isEnabled && result) {
        feeCache[action] = {
          ...feeCache[action],
          [coinName]: result,
        }
      }

      feeResolved(result)
    }

    if (coinData) {
      switch (coinData.type) {
        case COIN_TYPE.NATIVE:
          obtainedResult = await fetchFeeForNativeCoin({
            coinData,
            swapUTXOMethod: isBuyingUTXO ? 'withdraw' : 'deposit',
            swapABMethod: isBuyingAB ? 'withdraw' : 'deposit',
          })
          doResolve(obtainedResult)
          break
        case COIN_TYPE.ETH_TOKEN:
          obtainedResult = await fetchFeeForEthToken({
            coinData,
            swapABMethod: isBuyingAB ? 'withdraw' : 'deposit',
          })
          doResolve(obtainedResult)
          break
        default:
          reportAboutProblem({
            info: `Unknown coin type (${coinData.type}) for coin (${coinData.ticker})`,
          })
      }
    } else {
      reportAboutProblem({
        info: `Unknown coin (${coinName})`,
      })
    }
  })
}

const fetchFeeForNativeCoin = (params) => {
  const { coinData, swapUTXOMethod, swapABMethod } = params
  const coinTicker = coinData.ticker.toLowerCase()
  
  return new Promise((resolve) => {
    if (helpers[coinTicker]) {
      helpers[coinTicker]
        .estimateFeeValue({
          method: 'swap',
          swapUTXOMethod,
          swapABMethod,
        })
        .then((coinFee) =>
          resolve({
            coin: coinData.ticker,
            fee: coinFee,
            isUTXO: coinData.model === COIN_MODEL.UTXO,
          })
        )
        .catch((err) => {
          reportAboutProblem({
            info: `Fail fetch fee for coin ${coinData.ticker}. ${err}`,
            isError: true,
          })
          feeCache.isEnabled = false
          resolve({
            coin: coinData.ticker,
            fee: 0,
            isUTXO: coinData.model === COIN_MODEL.UTXO,
          })
        })
    } else {
      reportAboutProblem({
        info: `No helper 'estimateFeeValue' for coin ${coinData.ticker}`,
      })
    }
  })
}

const fetchFeeForEthToken = (params) => {
  const { coinData, swapABMethod } = params

  return new Promise((resolve) => {
    helpers.ethToken
      .estimateFeeValue({
        method: 'swap',
        speed: 'fast',
        swapABMethod,
      })
      .then((ethFee) =>
        resolve({
          coin: `ETH`,
          fee: ethFee,
          isUTXO: false,
        })
      )
      .catch((err) => {
        reportAboutProblem({
          info: `Fail fetch fee for token ${coinData.ticker} (ETH). ${err}`,
          isError: true,
        })
        feeCache.isEnabled = false
        resolve({
          coin: `ETH`,
          fee: 0,
          isUTXO: false,
        })
      })
  })
}

type PairFeesParams = {
  sellCurrency: string
  buyCurrency: string
  updateCacheValue?: boolean
}

export const getPairFees = (params: PairFeesParams): Promise<IPairFees> => {
  let { sellCurrency, buyCurrency, updateCacheValue = false } = params
  let originSell = sellCurrency.toLowerCase()
  let originBuy = buyCurrency.toLowerCase()

  if (config.binance) {
    if (sellCurrency.toLowerCase() === `bnb`) sellCurrency = `eth`
    if (buyCurrency.toLowerCase() === `bnb`) buyCurrency = `eth`
  }

  return new Promise(async (feeResolved) => {
    const sell = await fetchCoinFee({
      coinName: sellCurrency.toUpperCase(),
      action: 'sell',
      updateCacheValue,
    })
    const buy = await fetchCoinFee({
      coinName: buyCurrency.toUpperCase(),
      action: 'buy',
      updateCacheValue,
    })

    const byCoins = {
      [buy.coin]: buy,
      [sell.coin]: sell,
    }

    if (
      config.binance &&
      (
        originBuy.toLowerCase() === `eth`
        || originSell.toLowerCase() === `eth`
      )
    ) byCoins[`BNB`] = byCoins[`ETH`]

    const result = {
      sell,
      have: sell,
      buy,
      get: buy,
      byCoins,
    }

console.log('>>> getPairFees', result)
    feeResolved(result)
  })
}
