import config from 'app-config'
import TOKEN_STANDARDS from 'helpers/constants/TOKEN_STANDARDS'
const NETWORK = process.env.MAINNET ? 'mainnet' : 'testnet'

const getCustomTokenConfig = () => {
  //@ts-ignore: strictNullChecks
  let tokensInfo = JSON.parse(localStorage.getItem('customToken'))
  if (!tokensInfo || !tokensInfo[NETWORK]) return {}
  return tokensInfo[NETWORK]
}

let buildOpts = {
  curEnabled: false,
  blockchainSwapEnabled: false,
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

if (window?.widgetERC20Tokens?.length) {
  buildOpts.ownTokens = window.widgetERC20Tokens
}

if (Array.isArray(buildOpts.ownTokens) && buildOpts.ownTokens.length) {
  // ? we can't use here as whole string {#WIDGETTOKENCODE#} ?
  const wcPb = `{#`
  const wcP = (`WIDGETTOKENCODE`).toUpperCase()
  const wcPe = `#}`

  Object.keys(TOKEN_STANDARDS).forEach((key) => {
    config[TOKEN_STANDARDS[key].standard.toLowerCase()] = {}
  })

  buildOpts.ownTokens.forEach((token) => {
    const symbol = token.name.toLowerCase()
    const standard = token.standard.toLowerCase()

    if (symbol.toUpperCase() !== (`${wcPb}${wcP}${wcPe}`)) {
      config[standard][symbol] = token
    }
  })
}

const tokenItems: IUniversalObj[] = []

Object.keys(TOKEN_STANDARDS).forEach((key) => {
  const standard = TOKEN_STANDARDS[key].standard

  Object.keys(config[standard]).forEach((name) => {
    tokenItems.push({
      name: name.toUpperCase(),
      title: name.toUpperCase(),
      icon: name,
      value: name,
      fullTitle: name,
      addAssets: true,
      standard,
    })
  })
})

const tokenPartialItems: IUniversalObj[] = []

Object.keys(TOKEN_STANDARDS).forEach((key) => {
  const standard = TOKEN_STANDARDS[key].standard

  Object.keys(config[standard])
    .filter((name) => config[standard][name].canSwap)
    .forEach((name) => {
      tokenPartialItems.push({
        name: name.toUpperCase(),
        title: name.toUpperCase(),
        icon: name,
        value: name,
        fullTitle: config[standard][name].fullName || name,
        standard,
      })
    })
})

const initialState = {
  items: [
    //@ts-ignore
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.eth) ? [{
      name: 'ETH',
      title: 'ETH',
      icon: 'eth',
      value: 'eth',
      fullTitle: 'ethereum',
      addAssets: true,
    }] : [],
     //@ts-ignore
     ...(!buildOpts.curEnabled || buildOpts.curEnabled.bnb) ? [{
      name: 'BNB',
      title: 'BNB',
      icon: 'bnb',
      value: 'bnb',
      fullTitle: 'binance coin',
      addAssets: true,
    }] : [],
    //@ts-ignore
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.ghost) ? [{
      name: 'GHOST',
      title: 'GHOST',
      icon: 'ghost',
      value: 'ghost',
      fullTitle: 'ghost',
      addAssets: true,
    }] : [],
    //@ts-ignore
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.next) ? [{
      name: 'NEXT',
      title: 'NEXT',
      icon: 'next',
      value: 'next',
      fullTitle: 'next',
      addAssets: true,
    }] : [],
    //@ts-ignore
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
      name: 'BTC (PIN-Protected)',
      title: 'BTC (PIN-Protected)',
      icon: 'btc',
      value: 'btcMultisigPin',
      fullTitle: 'bitcoinMultisigPin',
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
    ...tokenItems,
  ],
  partialItems: [
    //@ts-ignore
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.eth) ? [{
      name: 'ETH',
      title: 'ETH',
      icon: 'eth',
      value: 'eth',
      fullTitle: 'ethereum',
    }] : [],
    //@ts-ignore
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.bnb) ? [{
      name: 'BNB',
      title: 'BNB',
      icon: 'bnb',
      value: 'bnb',
      fullTitle: 'binance coin',
    }] : [],
    //@ts-ignore
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.ghost) ? [{
      name: 'GHOST',
      title: 'GHOST',
      icon: 'ghost',
      value: 'ghost',
      fullTitle: 'ghost',
    }] : [],
    //@ts-ignore
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.next) ? [{
      name: 'NEXT',
      title: 'NEXT',
      icon: 'next',
      value: 'next',
      fullTitle: 'next',
    }] : [],
    //@ts-ignore
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.btc) ? [{
      name: 'BTC',
      title: 'BTC',
      icon: 'btc',
      value: 'btc',
      fullTitle: 'bitcoin',
    }] : [],
    ...tokenPartialItems,
  ],
  addSelectedItems: [],
  addPartialItems: [],
}


if (config.isWidget) {
  //@ts-ignore
  initialState.items = [
    //@ts-ignore
    {
      name: 'ETH',
      title: 'ETH',
      icon: 'eth',
      value: 'eth',
      fullTitle: 'ethereum',
    },
    //@ts-ignore
    {
      name: 'BNB',
      title: 'BNB',
      icon: 'bnb',
      value: 'bnb',
      fullTitle: 'binance coin',
    },
    //@ts-ignore
    {
      name: 'BTC',
      title: 'BTC',
      icon: 'btc',
      value: 'btc',
      fullTitle: 'bitcoin',
    },
    //@ts-ignore
    {
      name: 'GHOST',
      title: 'GHOST',
      icon: 'ghost',
      value: 'ghost',
      fullTitle: 'ghost',
    },
    //@ts-ignore
    {
      name: 'NEXT',
      title: 'NEXT',
      icon: 'next',
      value: 'next',
      fullTitle: 'next',
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
      name: 'BNB',
      title: 'BNB',
      icon: 'bnb',
      value: 'bnb',
      fullTitle: 'binance coin',
    },
    {
      name: 'BTC',
      title: 'BTC',
      icon: 'btc',
      value: 'btc',
      fullTitle: 'bitcoin',
    },
    {
      name: 'GHOST',
      title: 'GHOST',
      icon: 'ghost',
      value: 'ghost',
      fullTitle: 'ghost',
    },
    {
      name: 'NEXT',
      title: 'NEXT',
      icon: 'next',
      value: 'next',
      fullTitle: 'next',
    },
  ]

  // Мульти валюта с обратной совместимостью одиночного билда
  const widgetCustomTokens = window?.widgetERC20Tokens?.length ? window.widgetERC20Tokens : []

  if (widgetCustomTokens.length) {
    // First token in list - is main - fill single-token erc20 config
    const firstToken = widgetCustomTokens[0]

    config.erc20token = firstToken.name
    config[firstToken.standard][firstToken.name] = firstToken

    widgetCustomTokens.forEach((token) => {
      const name = token.name

      initialState.items.push({
        name: name.toUpperCase(),
        title: name.toUpperCase(),
        icon: name,
        value: name,
        fullTitle: token.fullName,
      })
      initialState.partialItems.push({
        name: name.toUpperCase(),
        title: name.toUpperCase(),
        icon: name,
        value: name,
        fullTitle: token.fullName,
      })
      initialState.addSelectedItems.push({
        //@ts-ignore
        name: name.toUpperCase(),
        //@ts-ignore
        title: name.toUpperCase(),
        //@ts-ignore
        icon: name,
        //@ts-ignore
        value: name,
        //@ts-ignore
        fullTitle: token.fullName,
      })
    })
  }


} else {
  // TODO: addCustomERC20 -> addCustomToken
  if (!config.isWidget && buildOpts.addCustomERC20) {
    const customTokenConfig = getCustomTokenConfig()

    Object.keys(customTokenConfig).forEach((standard) => {
      Object.keys(customTokenConfig[standard]).forEach((tokenContractAddr) => {
        const tokenObj = customTokenConfig[standard][tokenContractAddr]
        const { symbol } = tokenObj

        //@ts-ignore
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
    })
  }
}

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
