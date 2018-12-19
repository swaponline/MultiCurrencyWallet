import { tradeTicker } from 'helpers/constants'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import config from 'app-config'


const selectPair = (value) => {
  const { currencies:{ items } } = getState()

  const selectedItems = items.filter(item => pairs[value].includes(item.name))

  reducers.currencies.addSelectedItems(selectedItems)
}

const erc20Tokens = Object.keys(config.erc20)
  .map(key => key.toUpperCase())

const pairs = {
  eth: ['ETH', 'LTC', 'BTC'],
  btc: ['BTC', 'EOS', 'ETH', 'LTC', ...erc20Tokens ],
  eos: ['EOS', 'BTC'],
  ltc: ['BTC', 'LTC', 'ETH'],
  usdt: ['USDT', ...erc20Tokens],
}

Object.keys(config.erc20)
  .forEach(key => {
    pairs[key] = ['BTC', 'USDT', ...erc20Tokens]
  })


export default {
  selectPair,
}
