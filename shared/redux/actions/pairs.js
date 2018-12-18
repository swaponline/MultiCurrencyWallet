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
  eth: ['ETH', 'LTC', 'BTC'],
  btc: ['BTC', 'EOS', 'ETH', 'LTC',
    ...(Object.keys(config.erc20)
      .map(key => key.toUpperCase())) ],
  eos: ['EOS', 'BTC'],
  ltc: ['BTC', 'LTC', 'ETH'],
  usdt: ['USDT', ...(Object.keys(config.erc20)
    .map(key => key.toUpperCase())) ],
}
Object.keys(config.erc20)
  .forEach(key => {
    pairs[key] = ['BTC', 'USDT', ...(Object.keys(config.erc20)
      .map(key => key.toUpperCase()))]
  })


export default {
  selectPair,
}
