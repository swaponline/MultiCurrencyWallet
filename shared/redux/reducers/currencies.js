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

process.env.MAINNET && initialState.items.unshift({
  name: 'USDT',
  title: 'USDT',
  icon: 'usdt',
  value: 'usdt',
  fullTitle: 'USD Tether',
})


export {
  initialState,
}
