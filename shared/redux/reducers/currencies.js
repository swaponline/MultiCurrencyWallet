import config from 'app-config'


const initialState = {
  items: [
    {
      name: 'EOS',
      title: 'EOS',
      icon: 'eos',
      value: 'eos',
      fullTitle: 'EOS',
    },
    {
      name: 'ETH',
      title: 'ETH',
      icon: 'eth',
      value: 'eth',
      fullTitle: 'ethereum',
    },
    {
      name: 'LTC',
      title: 'LTC',
      icon: 'ltc',
      value: 'ltc',
      fullTitle: 'litecoin',
    },
    {
      name: 'BTC',
      title: 'BTC',
      icon: 'btc',
      value: 'btc',
      fullTitle: 'bitcoin',
    },
    ...(Object.keys(config.erc20)
      .map(key => ({
        name: key.toUpperCase(),
        title: key.toUpperCase(),
        icon: key,
        value: key,
        fullTitle: key,
      }))),
  ],
}

// eslint-disable-next-line
process.env.MAINNET && initialState.items.unshift({
  name: 'USDT',
  title: 'USDT',
  icon: 'usdt',
  value: 'usdt',
  fullTitle: 'USD Tether',
})

export const reverseCurrency = (state, { value }) => ({
  items: [].concat(...state.items.map((item, index) => {
    if (item.value === value) {
      const stateWithoutValue = [
        ...state.items.slice(0, index),
        ...state.items.slice(index + 1),
      ]

      stateWithoutValue.splice(0, 0, state.items[index])
      return stateWithoutValue
    }
    return null
  }).filter(item => item !== null)),
})

export {
  initialState,
}
