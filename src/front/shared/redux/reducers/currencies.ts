import config from 'app-config'
import TOKEN_STANDARDS from 'helpers/constants/TOKEN_STANDARDS'
import { BLOCKCHAIN as BLOCKCHAIN_TYPE } from 'swap.app/constants/COINS'

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
  addCustomTokens: true,
  invoiceEnabled: true,
}

if (window
  && window.buildOptions
  && Object.keys(window.buildOptions)
  && Object.keys(window.buildOptions).length
) {
  buildOpts = { ...buildOpts, ...window.buildOptions }
}

if (window?.widgetEvmLikeTokens?.length) {
  buildOpts.ownTokens = window.widgetEvmLikeTokens
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
  const blockchain = TOKEN_STANDARDS[key].currency

  Object.keys(config[standard]).forEach((name) => {
    tokenItems.push({
      name: name.toUpperCase(),
      title: name.toUpperCase(),
      icon: name,
      value: `{${blockchain.toUpperCase()}}${name}`,
      fullTitle: name,
      addAssets: true,
      blockchain: BLOCKCHAIN_TYPE[blockchain.toUpperCase()],
      standard,
    })
  })
})

const tokenPartialItems: IUniversalObj[] = []

Object.keys(TOKEN_STANDARDS).forEach((key) => {
  const standard = TOKEN_STANDARDS[key].standard
  const blockchain = TOKEN_STANDARDS[key].currency

  Object.keys(config[standard])
    .filter((name) => config[standard][name].canSwap)
    .forEach((name) => {
      tokenPartialItems.push({
        name: name.toUpperCase(),
        title: name.toUpperCase(),
        icon: name,
        value: `{${blockchain.toUpperCase()}}${name}`,
        fullTitle: config[standard][name].fullName || name,
        blockchain: BLOCKCHAIN_TYPE[blockchain.toUpperCase()],
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
      blockchain: BLOCKCHAIN_TYPE.ETH,
      addAssets: true,
    }] : [],
     //@ts-ignore
     ...(!buildOpts.curEnabled || buildOpts.curEnabled.bnb) ? [{
      name: 'BNB',
      title: 'BNB',
      icon: 'bnb',
      value: 'bnb',
      fullTitle: 'binance coin',
      blockchain: BLOCKCHAIN_TYPE.BNB,
      addAssets: true,
    }] : [],
    //@ts-ignore
      ...(!buildOpts.curEnabled || buildOpts.curEnabled.matic) ? [{
      name: 'MATIC',
      title: 'MATIC',
      icon: 'matic',
      value: 'matic',
      fullTitle: 'matic token',
      blockchain: BLOCKCHAIN_TYPE.MATIC,
      addAssets: true,
    }] : [],
    //@ts-ignore
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.arbeth) ? [{
      name: 'ARBETH',
      title: 'ARBETH',
      icon: 'arbeth',
      value: 'arbeth',
      fullTitle: 'arbitrum eth',
      blockchain: BLOCKCHAIN_TYPE.ARBITRUM,
      addAssets: true,
    }] : [],
    //@ts-ignore
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.ghost) ? [{
      name: 'GHOST',
      title: 'GHOST',
      icon: 'ghost',
      value: 'ghost',
      fullTitle: 'ghost',
      blockchain: BLOCKCHAIN_TYPE.GHOST,
      addAssets: true,
    }] : [],
    //@ts-ignore
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.next) ? [{
      name: 'NEXT',
      title: 'NEXT',
      icon: 'next',
      value: 'next',
      fullTitle: 'next',
      blockchain: BLOCKCHAIN_TYPE.NEXT,
      addAssets: true,
    }] : [],
    //@ts-ignore
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.btc) ? [{
      name: 'BTC',
      title: 'BTC',
      icon: 'btc',
      value: 'btc',
      fullTitle: 'bitcoin',
      blockchain: BLOCKCHAIN_TYPE.BTC,
      addAssets: true,
    },
    {
      name: 'BTC (SMS-Protected)',
      title: 'BTC (SMS-Protected)',
      icon: 'btc',
      value: 'btcMultisig',
      fullTitle: 'bitcoinMultisig',
      addAssets: false,
      blockchain: BLOCKCHAIN_TYPE.BTC,
      dontCreateOrder: true,
    },
    {
      name: 'BTC (PIN-Protected)',
      title: 'BTC (PIN-Protected)',
      icon: 'btc',
      value: 'btcMultisigPin',
      fullTitle: 'bitcoinMultisigPin',
      blockchain: BLOCKCHAIN_TYPE.BTC,
      addAssets: false,
      dontCreateOrder: true,
    },
    {
      name: 'BTC (Multisig)',
      title: 'BTC (Multisig)',
      icon: 'btc',
      value: 'btcMultisig',
      fullTitle: 'bitcoinMultisig',
      blockchain: BLOCKCHAIN_TYPE.BTC,
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
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.matic) ? [{
      name: 'MATIC',
      title: 'MATIC',
      icon: 'matic',
      value: 'matic',
      fullTitle: 'matic token',
    }] : [],
    //@ts-ignore
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.arbeth) ? [{
      name: 'ARBETH',
      title: 'ARBETH',
      icon: 'arbeth',
      value: 'arbeth',
      fullTitle: 'arbitrum eth',
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
  initialState.items = [
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
      name: 'MATIC',
      title: 'MATIC',
      icon: 'matic',
      value: 'matic',
      fullTitle: 'matic token',
    },
    {
      name: 'ARBETH',
      title: 'ARBETH',
      icon: 'arbeth',
      value: 'arbeth',
      fullTitle: 'arbitrum eth',
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
      name: 'MATIC',
      title: 'MATIC',
      icon: 'matic',
      value: 'matic',
      fullTitle: 'matic token',
    },
    {
      name: 'ARBETH',
      title: 'ARBETH',
      icon: 'arbeth',
      value: 'arbeth',
      fullTitle: 'arbitrum eth',
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
  const widgetCustomTokens = window?.widgetEvmLikeTokens?.length ? window.widgetEvmLikeTokens : []

  if (widgetCustomTokens.length) {
    // First token in list - is main - fill single-token erc20 config
    const firstToken = widgetCustomTokens[0]

    config.erc20token = firstToken.name
    config[firstToken.standard][firstToken.name] = firstToken

    widgetCustomTokens.forEach((token) => {
      const { name, standard, fullName } = token
      const baseCurrency = TOKEN_STANDARDS[standard]?.currency

      initialState.items.push({
        name: name.toUpperCase(),
        title: name.toUpperCase(),
        icon: name,
        value: `{${baseCurrency.toUpperCase()}}${name}`,
        fullTitle: fullName || name,
        addAssets: true,
        blockchain: BLOCKCHAIN_TYPE[baseCurrency.toUpperCase()],
        standard,
      })
      initialState.partialItems.push({
        name: name.toUpperCase(),
        title: name.toUpperCase(),
        icon: name,
        value: `{${baseCurrency.toUpperCase()}}${name}`,
        fullTitle: fullName || name,
        blockchain: BLOCKCHAIN_TYPE[baseCurrency.toUpperCase()],
        standard,
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
        fullTitle: fullName || name,
      })
    })
  }
}

if (buildOpts.addCustomTokens) {
  const customTokenConfig = getCustomTokenConfig()

  Object.keys(customTokenConfig).forEach((standard) => {
    Object.keys(customTokenConfig[standard]).forEach((tokenContractAddr) => {
      const tokenObj = customTokenConfig[standard][tokenContractAddr]
      const { symbol } = tokenObj
      const baseCurrency = TOKEN_STANDARDS[standard]?.currency

      //@ts-ignore
      initialState.items.push({
          name: symbol.toUpperCase(),
          title: symbol.toUpperCase(),
          icon: symbol,
          value: `{${baseCurrency.toUpperCase()}}${symbol}`,
          fullTitle: config[standard][symbol]?.fullName || symbol,
          addAssets: true,
          blockchain: BLOCKCHAIN_TYPE[baseCurrency.toUpperCase()],
          standard,
        })
      initialState.partialItems.push({
        name: symbol.toUpperCase(),
        title: symbol.toUpperCase(),
        icon: symbol,
        value: `{${baseCurrency.toUpperCase()}}${symbol}`,
        fullTitle: config[standard][symbol]?.fullName || symbol,
        blockchain: BLOCKCHAIN_TYPE[baseCurrency.toUpperCase()],
        standard,
      })
    })
  })
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
