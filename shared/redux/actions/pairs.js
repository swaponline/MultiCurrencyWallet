import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import config from 'app-config'
import { parsePair } from 'shared/pages/Home/Orders/Pair'
import TRADE_TICKERS from 'helpers/constants/TRADE_TICKERS'


const selectPair = (value) => {
  const { currencies:{ items } } = getState()

  const selectedPairsBase = TRADE_TICKERS
    .map(ticker => parsePair(ticker))
    .filter(({ BASE }) => BASE.toLowerCase() === value)
    .map(({ MAIN, BASE }) => MAIN)

  const selectedPairsMain = TRADE_TICKERS
    .map(ticker => parsePair(ticker))
    .filter(({ MAIN }) => MAIN.toLowerCase() === value)
    .map(({ MAIN, BASE }) => BASE)

  const pairs = selectedPairsBase.concat(selectedPairsMain)

  const selectedItems = items.filter(item => pairs.includes(item.name))

  reducers.currencies.addSelectedItems(selectedItems)
  return selectedItems

}

export default {
  selectPair,
}
