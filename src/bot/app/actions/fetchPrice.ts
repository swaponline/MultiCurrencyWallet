import { TRADE_TICKERS } from '../../config/constants'
import handleError from './errors/handleError'
import getPriceByPair from '../middlewares/prices'


let _isOutdated = true
let _firstRun = true
let _prices = []

const fetchPrice = async (obj, type?) => {
  const ticker = obj.ticker ? obj.ticker : obj

  try {
   // if (!TRADE_TICKERS.includes(ticker)) return

    if (_isOutdated || !(ticker in _prices)) {
      _isOutdated = false

      if (_firstRun) {
        _firstRun = false
        setTimeout(() => (_isOutdated = true), 5 * 1000)
      }

      //@ts-ignore: strictNullChecks
      _prices[ticker] = await getPriceByPair(ticker, type)
    }

    return _prices[ticker]
  } catch (err) {
    handleError(err)
  }
}

export default fetchPrice
