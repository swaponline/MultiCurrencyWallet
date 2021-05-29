import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import config from 'app-config'
import { parsePair } from 'shared/pages/Exchange/Orders/Pair'
import TRADE_TICKERS from 'helpers/constants/TRADE_TICKERS'
import actions from 'redux/actions'

type Currency = {
  fullTitle: string
  icon: string
  name: string
  title: string
  value: string
}

const filter = (value, tikers, items): Currency[] => {
  const selectedPairsBase = tikers
    .map(ticker => parsePair(ticker))
    .filter(({ BASE }) => BASE.toLowerCase() === value.toLowerCase())
    .map(({ MAIN, BASE }) => MAIN)

  const selectedPairsMain = tikers
    .map(ticker => parsePair(ticker))
    .filter(({ MAIN }) => MAIN.toLowerCase() === value.toLowerCase())
    .map(({ MAIN, BASE }) => BASE)

  const pairs = selectedPairsBase.concat(selectedPairsMain)

  const selectedItems = items
    .filter(item => pairs.includes(item.value.toUpperCase()))
    .concat(items.filter(item => item.value.toLowerCase() === value.toLowerCase()))

  return selectedItems
}

const selectPair = (value) => { // addOffer drop down
  const { currencies:{ items } } = getState()

  const pairs = actions.pairs.filter(value, TRADE_TICKERS, items)
  reducers.currencies.addSelectedItems(pairs)

  return pairs
}

// partial drop down
const selectPairPartial = (value): Currency[] | [] => {
  const partialItems = getState().currencies.partialItems // eslint-disable-line
  const pairs = actions.pairs.filter(value, TRADE_TICKERS, partialItems)

  reducers.currencies.addPartialItems(pairs)

  return pairs
}

export default {
  selectPair,
  filter,
  selectPairPartial,
}
