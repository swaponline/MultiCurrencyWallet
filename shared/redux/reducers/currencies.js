import config from 'app-config'


const GetCustromERC20 = () => {
  const configStorage = (process.env.MAINNET) ? 'mainnet' : 'testnet'

  let tokensInfo = JSON.parse(localStorage.getItem('customERC'))
  if (!tokensInfo || !tokensInfo[configStorage]) return {}
  return tokensInfo[configStorage]
}

let buildOpts = {
  curEnabled: false,
  ownTokens: false,
  addCustomERC20: true,
  invoiceEnabled: true,
}

if (window
  && window.buildOptions
  && Object.keys(window.buildOptions)
  && Object.keys(window.buildOptions).length
) {
  buildOpts = { ...buildOpts, ...window.buildOptions }
}

if (window
  && window.widgetERC20Tokens
  && Object.keys(window.widgetERC20Tokens)
  && Object.keys(window.widgetERC20Tokens).length
) {
  buildOpts.ownTokens = window.widgetERC20Tokens
}
if (buildOpts.ownTokens && Object.keys(buildOpts.ownTokens).length) {
  // Multi token mode
  const cleanERC20 = {}
  Object.keys(buildOpts.ownTokens).forEach((key) => {
    if (key !== ('{#' + 'WIDGETTOKENCODE' + '#}')) {
      const tokenData = buildOpts.ownTokens[key]
      cleanERC20[key] = tokenData
    }
  })
  config.erc20 = cleanERC20
}


const initialState = {
  items: [
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.eth) ? [{
      name: 'ETH',
      title: 'ETH',
      icon: 'eth',
      value: 'eth',
      fullTitle: 'ethereum',
      addAssets: true,
    }] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.btc) ? [{
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
      dontCreateOrder: true,
    },
    {
      name: 'BTC (Multisig)',
      title: 'BTC (Multisig)',
      icon: 'btc',
      value: 'btcMultisig',
      fullTitle: 'bitcoinMultisig',
      addAssets: false,
      dontCreateOrder: true,
    }] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.qtum) ? [{
      name: 'QTUM',
      title: 'QTUM',
      icon: 'qtum',
      value: 'qtum',
      fullTitle: 'qtum',
      addAssets: true,
    }] : [],
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
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.eth) ? [{
      name: 'ETH',
      title: 'ETH',
      icon: 'eth',
      value: 'eth',
      fullTitle: 'ethereum',
    }] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.btc) ? [{
      name: 'BTC',
      title: 'BTC',
      icon: 'btc',
      value: 'btc',
      fullTitle: 'bitcoin',
    }] : [],
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
  const multiTokenNames = (window.widgetERC20Tokens) ? Object.keys(window.widgetERC20Tokens) : []

  if (multiTokenNames.length > 0) {
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
} else {
  if (!config.isWidget && buildOpts.addCustomERC20) {
    const customERC = GetCustromERC20()
    Object.keys(customERC).forEach((tokenContract) => {
      const symbol = customERC[tokenContract].symbol
      initialState.items.push({
        name: symbol.toUpperCase(),
        title: symbol.toUpperCase(),
        icon: symbol.toLowerCase(),
        value: symbol.toLowerCase(),
        fullTitle: symbol,
      })
      initialState.partialItems.push({
        name: symbol.toUpperCase(),
        title: symbol.toUpperCase(),
        icon: symbol.toLowerCase(),
        value: symbol.toLowerCase(),
        fullTitle: symbol,
      })
    })
  }
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
