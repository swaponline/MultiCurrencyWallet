import config from 'app-config'


const initialState = {
  items: [
    {
      name: 'ETH',
      title: 'ETH',
      icon: 'eth',
      value: 'eth',
      fullTitle: 'ethereum',
      addAssets: true,
    },
    {
      name: 'LTC',
      title: 'LTC',
      icon: 'ltc',
      value: 'ltc',
      fullTitle: 'litecoin',
      addAssets: true,
    },
    {
      name: 'BTC',
      title: 'BTC',
      icon: 'btc',
      value: 'btc',
      fullTitle: 'bitcoin',
      addAssets: true,
    },
    {
      name: 'BTC (SMS-Protected)',
      title: 'BTC (SMS-Protected)',
      icon: 'btc',
      value: 'btcMultisig',
      fullTitle: 'bitcoinMultisig',
      addAssets: false,
    },
    {
      name: 'BTC (Multisig)',
      title: 'BTC (Multisig)',
      icon: 'btc',
      value: 'btcMultisig',
      fullTitle: 'bitcoinMultisig',
      addAssets: false,
    },
    {
      name: 'QTUM',
      title: 'QTUM',
      icon: 'qtum',
      value: 'qtum',
      fullTitle: 'qtum',
      addAssets: true,
    },
    ...(Object.keys(config.erc20)
      .map(key => ({
        name: key.toUpperCase(),
        title: key.toUpperCase(),
        icon: key,
        value: key,
        fullTitle: key,
        addAssets: true,
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
  ]
  
  // Мульти валюта с обратной совместимостью одиночного билда
  const multiTokenNames = Object.keys(window.widgetERC20Tokens)

  if (multiTokenNames.length>0) {
    // First token in list - is main - fill single-token erc20 config
    config.erc20token = multiTokenNames[0]
    config.erc20[config.erc20token] = window.widgetERC20Tokens[config.erc20token]
    multiTokenNames.forEach((key) => {
      initialState.items.push({
        name: key.toUpperCase(),
        title: key.toUpperCase(),
        icon: key,
        value: key,
        fullTitle: window.widgetERC20Tokens[key].fullName,
      })
      initialState.partialItems.push({
        name: key.toUpperCase(),
        title: key.toUpperCase(),
        icon: key,
        value: key,
        fullTitle: window.widgetERC20Tokens[key].fullName,
      })
    })
    
  } else {
    initialState.items.push({
      name: config.erc20token.toUpperCase(),
      title: config.erc20token.toUpperCase(),
      icon: config.erc20token,
      value: config.erc20token,
      fullTitle: config.erc20[config.erc20token].fullName,
    })
    initialState.partialItems.push({
      name: config.erc20token.toUpperCase(),
      title: config.erc20token.toUpperCase(),
      icon: config.erc20token,
      value: config.erc20token,
      fullTitle: config.erc20[config.erc20token].fullName,
    })
  }
  initialState.items.push({
    name: 'ETH',
    title: 'ETH',
    icon: 'eth',
    value: 'eth',
    fullTitle: 'ethereum',
  })

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
  addAssets: true,
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
