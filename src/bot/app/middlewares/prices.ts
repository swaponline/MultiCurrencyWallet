import BigNumber from 'bignumber.js'
import request from 'request-promise-cache'

import * as configStorage from '../../config/storage'
import getUnixTimeStamp from 'common/utils/getUnixTimeStamp'



const BTC_SYMBOL = 1 // BTC
const LTC_SYMBOL = 2 // LTC is 2
const ETH_SYMBOL = 1027 // ETH is 1027
const JOT_SYMBOL = 2948 // Jury.Online
const SNM_SYMBOL = 1723
const GHOST_SYMBOL = 5471

const COIN_API = `https://api.coinmarketcap.com/v2`
const YOBIT_API = `https://yobit.net/api/3`

const btcPrice = () => getNoxonPrice('BTC', 'USD')
const usdPrice = () => btcPrice().then(usds => new BigNumber(1).div(usds))


let _priceCache = {}
const _priceCacheTime = 60 // 60 секунд, для облегчения на этапе заполнения ордеров

export const getNoxonPrice = (symbol, base = 'BTC') => {
  return request({
    url: `https://noxon.wpmix.net/cursAll.php`,
    cacheTTL: 86400000
  })
    .then((res) => {
      try {
        return JSON.parse(res)
      } catch (error) {
        console.error('getNoxonPrice fail parse JSON')
        //console.error(res)
        console.error(error)
      }
    })
    .then((json: any) => {
      if (json && json.data) {
        let btcData: any = false

        if (base.toUpperCase() === `BTC`) {
          btcData = json.data.filter(item => item && item.symbol && item.symbol.toUpperCase() === `BTC`)
          if (btcData.length) {
            btcData = btcData[0]
          }
        }

        const btcPrice = (
          btcData
          && btcData.quote
          && btcData.quote.USD
          && btcData.quote.USD.price
        ) ? btcData.quote.USD.price : null

        let symbolInfo = json.data.filter((item) => (item && item.symbol && item.symbol.toUpperCase() === symbol.toUpperCase()))

        if (symbolInfo.length > 0) {
          symbolInfo = symbolInfo[0]
          if (base.toUpperCase() === `USD`) return symbolInfo.quote.USD.price
          if (base.toUpperCase() === `BTC`) {
            console.log('Convert price to BTC', symbol, base, btcPrice, symbolInfo.quote.USD.price)
            const priceInBtc = symbolInfo.quote.USD.price / btcPrice
            return priceInBtc
          }
        }
        console.log("Cant get price for ", symbol, base)
      }
    })
    .then(num => new BigNumber(num))
    .catch((error) => {
      console.error(`Cannot get ${symbol} price (from noxon)`)
      console.error(error)
    })
}

const getYobitPrice = (symbol) =>
  request(`${YOBIT_API}/ticker/${symbol.toLowerCase()}`)
    .then(res => JSON.parse(res))
    .then((json) => {
      return json[symbol.toLowerCase()].last
    })
    .then(num => new BigNumber(num))
    .catch(error => {
      console.error(`Cannot get (getYobitPrice) ${symbol} price: ${error}`)
      return null
    })

const getPrice = (symbol, base = 'BTC') =>
  request({
    url: `${COIN_API}/ticker/${symbol}/?convert=${base}`,
    cacheTTL: 86400000
  })
    .then(res => JSON.parse(res))
    .then(json => json.data.quotes[base].price)
    .then(num => new BigNumber(num))
    .catch(error => {
      console.error(`Cannot get (getPrice) ${symbol} price: ${error}`)
      return null
    })


export const getPriceByPair = async (pair, type?) => {
  if (configStorage.hasTradeConfig()) {
    return await calcPairPrice(pair)
  }
  if (type) {
    switch (type) {
      case 'token':
        console.log('getPriceByPair - token type', pair)
        const [ pair_main, pair_base ] = pair.split('-')

        const token_price = await getPrice(BTC_SYMBOL, pair_main)

        return new BigNumber(1).div(token_price)
    }
  }

  switch (pair) {
    case 'BTC-WBTC':
      return new BigNumber('1')
    case 'WBTC-BTC':
      return new BigNumber('1')
    case 'BTC-USDT':
      return btcPrice()

    case 'ETH-BTC':
      return getNoxonPrice('ETH')
      return getPrice(ETH_SYMBOL)

    case 'SYC2':
      return null;

    case 'LTC-BTC':
      return getNoxonPrice('LTC')
      return getPrice(LTC_SYMBOL)

    case'JOT-BTC':
      return getNoxonPrice('JOT')
      return getPrice(JOT_SYMBOL)

    case 'USD-BTC':
      return usdPrice()

    case 'SWAP-BTC':
      return usdPrice().then(price => price.multipliedBy('1'))
    case 'USDT-NEXT':
      return new BigNumber(0.0001)
    case 'ETH-NEXT':
      return new BigNumber(0.001)
      return usdPrice().then(price => {
        console.log('getPrice for ETH-NEXT', price, price.toString())
        return price.multipliedBy(1)
      })
    case 'USDT-BTC':
      return usdPrice().then(price => {
        console.log('getPrice for USDT-BTC', price, price.toString())
        return price.multipliedBy('1')
      })
    case 'GHOST-BTC':
      return usdPrice().then(price => price.multipliedBy('2'))
    case 'SNM-BTC':
      console.log(await getNoxonPrice('SNM'))
      return new BigNumber( await getPrice(SNM_SYMBOL) ).multipliedBy(0.7)
    case 'JACK-BTC':
      return usdPrice().then(price => price.multipliedBy('0.02'))

    case 'SWAP-USDT':
      return new BigNumber('5')

    case 'NOXON-USDT':
      return new BigNumber('42.3256')

    case 'NOXON-BTC':
      return getPrice(ETH_SYMBOL)

    case 'BTRM-BTC':
      return getYobitPrice('BTRM_BTC')

    case 'XSAT-BTC':
      return usdPrice().then(price => price.multipliedBy('0.13'))
  }
}


export const syncPrices = async () => {
  console.log('app.middlewares.prices syncPrices')

  return {
    'ETH-BTC': await getPrice(ETH_SYMBOL),
    'JOT-BTC': await getPrice(JOT_SYMBOL),
    'USD-BTC': await usdPrice(),
    'WBTC-BTC': new BigNumber('1'),
    'BTC-WBTC': new BigNumber('1'),
    'ETH-NEXT': new BigNumber(0.001),
    'USDT-NEXT': new BigNumber(0.0001),
    'SWAP-BTC': await usdPrice().then(price => price.multipliedBy('5')),
    'USDT-BTC': await usdPrice().then(price => price.multipliedBy('1')),
    'SNM-BTC': await getPrice(SNM_SYMBOL),
    'SWAP-USDT': await Promise.resolve(new BigNumber('5')),
    'NOXON-USDT': await Promise.resolve(new BigNumber('42.3256')),
    'NOXON-BTC': await getPrice(ETH_SYMBOL),
    'BTRM-BTC': await getYobitPrice('BTRM_BTC'),
    'XSAT-BTC': await usdPrice().then(price => price.multipliedBy('0.13')),
  }
}

export const getCoinPriceCache = (coin: string): BigNumber => {
  if (_priceCache[coin]) {
    if (getUnixTimeStamp() < _priceCache[coin].utx) {
      return _priceCache[coin].price
    }
  }
  //@ts-ignore: strictNullChecks
  return null
}

export const getCoinPrice = (coin: string): Promise<BigNumber> => {
  return new Promise(async (resolve) => {
    const cachedPrice: BigNumber = getCoinPriceCache(coin)
    if (cachedPrice !== null) {
      resolve(cachedPrice)
    } else {
      const priceConfig = configStorage.getCoinPriceConfig(coin)
      if (priceConfig) {
        let coinPrice = new BigNumber(0)
        switch (priceConfig.source) {
          case `FIXED`: // Фиксированая цена
            coinPrice = new BigNumber(priceConfig.price)
            break
          case `API`: // API
            switch (priceConfig.api) {
              case `SWAPONLINE`:
                coinPrice = new BigNumber(await getNoxonPrice(coin, 'USD'))
                break
              case `YOBIT`:
                coinPrice = new BigNumber(await getYobitPrice(`${coin.toLowerCase()}_usd`))
                break
              default:
                console.warn(`Unknown price API '${priceConfig.api}' for coin '${coin}'.`)
                break
            }
            break
          case `COIN`: // От цены другой монеты
            const baseCoinPrice = await getCoinPrice(priceConfig.coin)
            coinPrice = baseCoinPrice.multipliedBy(priceConfig.count)
        }
        // Check stoplost
        if (priceConfig.minSafePrice) {
          if (coinPrice.isLessThan(priceConfig.minSafePrice)) {
            coinPrice = new BigNumber(priceConfig.minSafePrice)
          }
        }
        _priceCache[coin] = {
          price: coinPrice,
          utx: getUnixTimeStamp() + _priceCacheTime,
        }
        resolve(coinPrice)
      } else {
        /*
          Бот в режиме единого конфига
          Не удалось найти параметры расчета для монеты
          Нужно проверить правильность единой конфигурации (./tradeconfig.[network].json)
        */
        console.warn(`Price for ${coin} not calculated - used Zero (0)`)
        console.warn(`In our world it is impossible to divide by zero :(`)
        console.warn(`May be errors in stack trace after this warning. For fix find this line`)
        resolve(new BigNumber(0))
      }
    }
  })
}

const calcPairPrice = async (pair) => {
  const [ head, base ] = pair.split(`-`)
  // Нужно расчитать соотношение одной цены к другой.
  // В боте валюты привязаны к BTC
  const headPrice = await getCoinPrice(head)
  const basePrice = await getCoinPrice(base)

  const price = headPrice.dividedBy(basePrice)

  return price
}

export default getPriceByPair
