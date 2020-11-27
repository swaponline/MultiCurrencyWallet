import BigNumber from 'bignumber.js'
import request from 'request-promise-cache'


const BTC_SYMBOL = 1 // BTC
const LTC_SYMBOL = 2 // LTC is 2
const ETH_SYMBOL = 1027 // ETH is 1027
const JOT_SYMBOL = 2948 // Jury.Online
const SNM_SYMBOL = 1723
const GHOST_SYMBOL = 5471

const COIN_API = `https://api.coinmarketcap.com/v2`
const YOBIT_API = `https://yobit.net/api/3`

const btcPrice = () => getNoxonPrice('BTC', 'USD')
const usdPrice = () => btcPrice().then(usds => BigNumber(1).div(usds))

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
    .then((json) => {
      if (json && json.data) {
        let btcData = false
        
        if (base.toUpperCase() === `BTC`){
          btcData = json.data.filter(item => item && item.symbol && item.symbol.toUpperCase() === `BTC`)
          if(btcData.length) {
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
        if (symbolInfo.length>0) {
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
    .then(num => BigNumber(num))
    .catch((error) => {
      console.error(`Cannot get ${symbol} price (from noxon)`)
      console.error(error)
    })
}

const getYobitPrice = (symbol) =>
  request(`${YOBIT_API}/ticker/${symbol.toLowerCase()}`)
    .then(res => JSON.parse(res))
    .then(json => json[symbol.toLowerCase()].last
    )
    .then(num => BigNumber(num))
    .catch(error => {
      console.error(`Cannot get (getYobitPrice) ${symbol} price: ${error}`)
      return null
    })

export const getPrice = (symbol, base = 'BTC') =>
  request({
    url: `${COIN_API}/ticker/${symbol}/?convert=${base}`,
    cacheTTL: 86400000
  })
    .then(res => JSON.parse(res))
    .then(json => json.data.quotes[base].price)
    .then(num => BigNumber(num))
    .catch(error => {
      console.error(`Cannot get (getPrice) ${symbol} price: ${error}`)
      return null
    })


export const getPriceByPair = async (pair, type) => {
  if (type) {
    switch (type) {
      case 'token':
        console.log('getPriceByPair - token type', pair)
        const [ pair_main, pair_base ] = pair.split('-')

        const token_price = await getPrice(BTC_SYMBOL, pair_main)

        return BigNumber(1).div(token_price)
    }
  }

  switch (pair) {
    case 'BTC-WBTC':
      return BigNumber('1')
    case 'WBTC-BTC':
      return BigNumber('1')
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
    case 'ETH-NEXT':
      return new BigNumber(0.01)
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
      return BigNumber( await getPrice(SNM_SYMBOL) ).multipliedBy(0.7)
    case 'JACK-BTC':
      return usdPrice().then(price => price.multipliedBy('0.02'))

    case 'SWAP-USDT':
      return BigNumber('5')

    case 'NOXON-USDT':
      return BigNumber('42.3256')

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
    'WBTC-BTC': BigNumber('1'),
    'BTC-WBTC': BigNumber('1'),
    'ETH-NEXT': new BigNumber(0.01), //await usdPrice().then(price => price.multipliedBy('1')),
    'SWAP-BTC': await usdPrice().then(price => price.multipliedBy('5')),
    'USDT-BTC': await usdPrice().then(price => price.multipliedBy('1')),
    'SNM-BTC': await getPrice(SNM_SYMBOL),
    'SWAP-USDT': await Promise.resolve(BigNumber('5')),
    'NOXON-USDT': await Promise.resolve(BigNumber('42.3256')),
    'NOXON-BTC': await getPrice(ETH_SYMBOL),
    'BTRM-BTC': await getYobitPrice('BTRM_BTC'),
    'XSAT-BTC': await usdPrice().then(price => price.multipliedBy('0.13')),
  }
}

export default getPriceByPair
// module.exports = getPriceByPair
