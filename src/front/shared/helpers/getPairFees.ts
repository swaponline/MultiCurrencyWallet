import { COIN_DATA, COIN_MODEL, COIN_TYPE } from 'swap.app/constants/COINS'
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

const feeCache = {
  isEnabled: true,
}

const fetchCoinFee = (args): Promise<CoinFee> => {
  const { coinName, action, fixed } = args

  return new Promise(async (feeResolved) => {
    const hasFeeInCache = feeCache[action] && feeCache[action][coinName]
    const coinData = COIN_DATA[coinName]
    let obtainedResult = undefined

    if (hasFeeInCache) {
      console.log('VALUE FROM CACHE')
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
          obtainedResult = await fetchFeeForNativeCoin({ coinData, fixed })
          doResolve(obtainedResult)
          break
        case COIN_TYPE.ETH_TOKEN:
          obtainedResult = await fetchFeeForEthToken({ coinData })
          doResolve(obtainedResult)
          break
        default:
          console.warn(
            `Helpers > fetchCoinFee Unknown coin type (${coinData.type}) for coin (${coinData.ticker})`
          )
          break
      }
    } else {
      console.warn(`Helpers > fetchCoinFee - Unknown coin (${coinName})`)
    }
  })
}

const fetchFeeForNativeCoin = (params) => {
  const { coinData, fixed } = params

  return new Promise((resolve) => {
    if (
      helpers[coinData.ticker.toLowerCase()] &&
      helpers[coinData.ticker.toLowerCase()].estimateFeeValue &&
      typeof helpers[coinData.ticker.toLowerCase()].estimateFeeValue === `function`
    ) {
      helpers[coinData.ticker.toLowerCase()]
        .estimateFeeValue({ method: 'swap', fixed })
        .then((coinFee) => resolve({
          coin: coinData.ticker,
          fee: coinFee,
          isUTXO: coinData.model === COIN_MODEL.UTXO,
        }))
        .catch((err) => {
          console.error(`Fail fetch fee for coin ${coinData.ticker}`, err)
          feeCache.isEnabled = false
          resolve({
            coin: coinData.ticker,
            fee: 0,
            isUTXO: coinData.model === COIN_MODEL.UTXO,
          })
        })
    } else {
      console.warn(`No helper 'estimateFeeValue' for coin ${coinData.ticker}`)
    }
  })
}

const fetchFeeForEthToken = (params) => {
  const { coinData } = params

  return new Promise((resolve) => {
    helpers.eth
    .estimateFeeValue({ method: 'swap', speed: 'fast' })
    .then((ethFee) => resolve({
      coin: `ETH`,
      fee: ethFee,
      isUTXO: false,
    }))
    .catch((err) => {
      console.error(`Fail fetch fee for coin ${coinData.ticker} (ETH)`, err)
      feeCache.isEnabled = false
      resolve({
        coin: `ETH`,
        fee: 0,
        isUTXO: false,
      })
    })
  })
}

export const getPairFees = (params): Promise<PairFees> => {
  const { sellCurrency, buyCurrency } = params
  const sellCurrencyUpp = sellCurrency.toUpperCase()
  const buyCurrencyUpp = buyCurrency.toUpperCase()
  // for currency with UTXO model that we buy
  // we use default tx size (one input)
  const coinIsBought = COIN_DATA[buyCurrencyUpp].model === COIN_MODEL.UTXO

  return new Promise(async (feeResolved) => {
    const sell = await fetchCoinFee({
      coinName: sellCurrencyUpp,
      action: 'sell',
    })
    const buy = await fetchCoinFee({
      coinName: buyCurrencyUpp,
      action: 'buy',
      fixed: coinIsBought,
    })

    const byCoins = {
      [buy.coin]: buy,
      [sell.coin]: sell,
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
