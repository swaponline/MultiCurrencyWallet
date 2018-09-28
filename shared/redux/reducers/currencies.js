import config from 'app-config'


export const initialState = {
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
      name: 'BCH',
      title: 'BCH',
      icon: 'bch',
      value: 'bch',
      fullTitle: 'Bitcoin Cash',
    },
    {
      name: 'BTC',
      title: 'BTC',
      icon: 'btc',
      value: 'btc',
      fullTitle: 'bitcoin',
    },
    process.env.MAINNET && {
      name: 'USDT',
      title: 'USDT',
      icon: 'usdt',
      value: 'usdt',
      fullTitle: 'USD Tether',
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
