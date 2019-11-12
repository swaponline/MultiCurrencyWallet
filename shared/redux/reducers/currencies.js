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
    {
      name: 'BTC (SMS-Protected)',
      title: 'BTC (SMS-Protected)',
      icon: 'btc',
      value: 'btcMultisig',
      fullTitle: 'bitcoinMultisig',
    },
    {
      name: 'QTUM',
      title: 'QTUM',
      icon: 'qtum',
      value: 'qtum',
      fullTitle: 'qtum',
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
  partialItems: [
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
    {
      name: 'BCH',
      title: 'BCH',
      icon: 'bch',
      value: 'bch',
      fullTitle: 'bitcoin cash',
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
  addSelectedItems: [],
  addPartialItems: [],
}

if (config.isWidget) {
  initialState.items = [
    {
      name: 'BTC',
      title: 'BTC',
      icon: 'btc',
      value: 'btc',
      fullTitle: 'bitcoin',
    },
    {
      name: config.erc20token.toUpperCase(),
      title: config.erc20token.toUpperCase(),
      icon: config.erc20token,
      value: config.erc20token,
      fullTitle: config.erc20[config.erc20token].fullName,
    },
    {
      name: 'ETH',
      title: 'ETH',
      icon: 'eth',
      value: 'eth',
      fullTitle: 'ethereum',
    },
  ]
  initialState.partialItems = [
    {
      name: 'ETH',
      title: 'ETH',
      icon: 'eth',
      value: 'eth',
      fullTitle: 'ethereum',
    },
    {
      name: 'BTC',
      title: 'BTC',
      icon: 'btc',
      value: 'btc',
      fullTitle: 'bitcoin',
    },
    {
      name: config.erc20token.toUpperCase(),
      title: config.erc20token.toUpperCase(),
      icon: config.erc20token,
      value: config.erc20token,
      fullTitle: config.erc20[config.erc20token].fullName,
    },
  ]

  initialState.addSelectedItems = [
    {
      name: config.erc20token.toUpperCase(),
      title: config.erc20token.toUpperCase(),
      icon: config.erc20token,
      value: config.erc20token,
      fullTitle: config.erc20[config.erc20token].fullName,
    },
  ]
}
// eslint-disable-next-line
// process.env.MAINNET && initialState.items.unshift({
//   name: 'USDT',
//   title: 'USDT',
//   icon: 'usdt',
//   value: 'usdt',
//   fullTitle: 'USD Tether',
// })
// eslint-disable-next-line
process.env.TESTNET && initialState.items.unshift({
  name: 'BCH',
  title: 'BCH',
  icon: 'bch',
  value: 'bch',
  fullTitle: 'bitcoin cash',
})

const addSelectedItems = (state, payload) => ({
  ...state,
  addSelectedItems: payload,
})

const addPartialItems = (state, payload) => ({
  ...state,
  addPartialItems: payload,
})

const updatePartialItems = (state, payload) => ({
  ...state,
  partialItems: payload,
})

const deletedPartialCurrency = (state, payload) => ({
  ...state,
  partialItems: state.partialItems.filter(item => item.name !== payload),
})

export {
  initialState,
  addSelectedItems,
  addPartialItems,
  updatePartialItems,
  deletedPartialCurrency,
}
