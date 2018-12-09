import { tradeTicker } from 'helpers/constants'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import config from 'app-config'

const selectPair = (value) => {
  const { currencies:{ items } } = getState()
  const selectedItems = items.filter(item => pairs[value].includes(item.name))

  reducers.currencies.addSelectedItems(selectedItems)
}

const pairs = {
  eth: ['LTC', 'BTC', 'ETH'],
  btc: ['EOS', 'ETH', 'LTC', 'BTC',
    ...(Object.keys(config.erc20)
      .map(key => key.toUpperCase())) ],
  eos: ['BTC', 'EOS'],
  ltc: ['EOS', 'BTC', 'LTC'],
  usdt: ['USDT', ...(Object.keys(config.erc20)
    .map(key => key.toUpperCase())) ],
}
Object.keys(config.erc20)
  .forEach(key => {
    pairs[key] = ['BTC', 'USDT']
  })



export default {
  selectPair,
}
