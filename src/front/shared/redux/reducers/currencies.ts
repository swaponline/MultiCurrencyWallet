import config from 'app-config'
import TOKEN_STANDARDS, { EXISTING_STANDARDS } from 'helpers/constants/TOKEN_STANDARDS'
import { BLOCKCHAIN as BLOCKCHAIN_TYPE } from 'swap.app/constants/COINS'

const getCustomTokenConfig = () => {
  let tokensInfo = JSON.parse(localStorage.getItem('customToken') || 'false')

  if (!tokensInfo || !tokensInfo[config.entry]) return {}

  return tokensInfo[config.entry]
}

interface BuildOptions {
  curEnabled: false | Record<string, boolean>,
  blockchainSwapEnabled: false | Record<string, boolean>,
  ownTokens: boolean,
  addCustomTokens: boolean,
  invoiceEnabled: boolean,
}

let buildOpts: BuildOptions = {
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

  EXISTING_STANDARDS.forEach((standard) => {
    config[standard] = {}
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
const tokenPartialItems: IUniversalObj[] = []

EXISTING_STANDARDS.forEach((standard) => {
  const { currency } = TOKEN_STANDARDS[standard]
  const tokenNames = Object.keys(config[standard])

  tokenNames.forEach((name) => {
    tokenItems.push({
      name: name.toUpperCase(),
      title: name.toUpperCase(),
      icon: name,
      value: `{${currency.toUpperCase()}}${name}`,
      fullTitle: name,
      addAssets: true,
      blockchain: BLOCKCHAIN_TYPE[currency.toUpperCase()],
      standard,
    })
  })

  tokenNames
    .filter((name) => config[standard][name].canSwap)
    .forEach((name) => {
      tokenPartialItems.push({
        name: name.toUpperCase(),
        title: name.toUpperCase(),
        icon: name,
        value: `{${currency.toUpperCase()}}${name}`,
        fullTitle: config[standard][name].fullName || name,
        blockchain: BLOCKCHAIN_TYPE[currency.toUpperCase()],
        standard,
      })
    })
})

const baseCurrencyConfig = {
  ETH: {
    name: 'ETH',
    title: 'ETH',
    icon: 'eth',
    value: 'eth',
    fullTitle: 'ethereum',
  },
  BNB: {
    name: 'BNB',
    title: 'BNB',
    icon: 'bnb',
    value: 'bnb',
    fullTitle: 'binance coin',
  },
  MATIC: {
    name: 'MATIC',
    title: 'MATIC',
    icon: 'matic',
    value: 'matic',
    fullTitle: 'matic token',
  },
  ARBETH: {
    name: 'ARBETH',
    title: 'ARBETH',
    icon: 'arbeth',
    value: 'arbeth',
    fullTitle: 'arbitrum eth',
  },
  AURETH: {
    name: 'AURETH',
    title: 'AURETH',
    icon: 'aureth',
    value: 'aureth',
    fullTitle: 'aurora eth',
  },
  XDAI: {
    name: 'XDAI',
    title: 'XDAI',
    icon: 'xdai',
    value: 'xdai',
    fullTitle: 'xdai',
  },
  FTM: {
    name: 'FTM',
    title: 'FTM',
    icon: 'ftm',
    value: 'ftm',
    fullTitle: 'ftm',
  },
  AVAX: {
    name: 'AVAX',
    title: 'AVAX',
    icon: 'avax',
    value: 'avax',
    fullTitle: 'avax',
  },
  MOVR: {
    name: 'MOVR',
    title: 'MOVR',
    icon: 'movr',
    value: 'movr',
    fullTitle: 'moonriver',
  },
  ONE: {
    name: 'ONE',
    title: 'ONE',
    icon: 'one',
    value: 'one',
    fullTitle: 'harmony one',
  },
  AME: {
    name: 'AME',
    title: 'AME',
    icon: 'ame',
    value: 'ame',
    fullTitle: 'ame',
  },
  PHI_V1: {
    name: 'PHI_V1',
    title: 'PHI_V1',
    icon: 'phi_v1',
    value: 'phi_v1',
    fullTitle: 'phi_v1',
  },
  PHI: {
    name: 'PHI',
    title: 'PHI',
    icon: 'phi',
    value: 'phi',
    fullTitle: 'phi',
  },
  FKW: {
    name: 'FKW',
    title: 'FKW',
    icon: 'fkw',
    value: 'fkw',
    fullTitle: 'fkw',
  },
  PHPX: {
    name: 'PHPX',
    title: 'PHPX',
    icon: 'phpx',
    value: 'phpx',
    fullTitle: 'phpx',
  },
  GHOST: {
    name: 'GHOST',
    title: 'GHOST',
    icon: 'ghost',
    value: 'ghost',
    fullTitle: 'ghost',
  },
  NEXT: {
    name: 'NEXT',
    title: 'NEXT',
    icon: 'next',
    value: 'next',
    fullTitle: 'next',
  },
  BTC: {
    name: 'BTC',
    title: 'BTC',
    icon: 'btc',
    value: 'btc',
    fullTitle: 'bitcoin',
  },
}

const initialState = {
  items: [
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.eth) ? [{
      ...baseCurrencyConfig.ETH,
      blockchain: BLOCKCHAIN_TYPE.ETH,
      addAssets: true,
    }] : [],
     ...(!buildOpts.curEnabled || buildOpts.curEnabled.bnb) ? [{
      ...baseCurrencyConfig.BNB,
      blockchain: BLOCKCHAIN_TYPE.BNB,
      addAssets: true,
    }] : [],
      ...(!buildOpts.curEnabled || buildOpts.curEnabled.matic) ? [{
      ...baseCurrencyConfig.MATIC,
      blockchain: BLOCKCHAIN_TYPE.MATIC,
      addAssets: true,
    }] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.arbeth) ? [{
      ...baseCurrencyConfig.ARBETH,
      blockchain: BLOCKCHAIN_TYPE.ARBITRUM,
      addAssets: true,
    }] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.aureth) ? [{
      ...baseCurrencyConfig.AURETH,
      blockchain: BLOCKCHAIN_TYPE.AURETH,
      addAssets: true,
    }] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.xdai) ? [{
      ...baseCurrencyConfig.XDAI,
      blockchain: BLOCKCHAIN_TYPE.XDAI,
      addAssets: true,
    }] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.ftm) ? [{
      ...baseCurrencyConfig.FTM,
      blockchain: BLOCKCHAIN_TYPE.FTM,
      addAssets: true,
    }] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.avax) ? [{
      ...baseCurrencyConfig.AVAX,
      blockchain: BLOCKCHAIN_TYPE.AVAX,
      addAssets: true,
    }] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.movr) ? [{
      ...baseCurrencyConfig.MOVR,
      blockchain: BLOCKCHAIN_TYPE.MOVR,
      addAssets: true,
    }] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.one) ? [{
      ...baseCurrencyConfig.ONE,
      blockchain: BLOCKCHAIN_TYPE.ONE,
      addAssets: true,
    }] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.phi_v1) ? [{
      ...baseCurrencyConfig.PHI_V1,
      blockchain: BLOCKCHAIN_TYPE.PHI_V1,
      addAssets: true,
    }] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.phi) ? [{
      ...baseCurrencyConfig.PHI,
      blockchain: BLOCKCHAIN_TYPE.PHI,
      addAssets: true,
    }] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.fkw) ? [{
      ...baseCurrencyConfig.FKW,
      blockchain: BLOCKCHAIN_TYPE.FKW,
      addAssets: true,
    }] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.phpx) ? [{
      ...baseCurrencyConfig.PHPX,
      blockchain: BLOCKCHAIN_TYPE.PHPX,
      addAssets: true,
    }] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.ame) ? [{
      ...baseCurrencyConfig.AME,
      blockchain: BLOCKCHAIN_TYPE.AME,
      addAssets: true,
    }] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.ghost) ? [{
      ...baseCurrencyConfig.GHOST,
      blockchain: BLOCKCHAIN_TYPE.GHOST,
      addAssets: true,
    }] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.next) ? [{
      ...baseCurrencyConfig.NEXT,
      blockchain: BLOCKCHAIN_TYPE.NEXT,
      addAssets: true,
    }] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.btc) ? [{
      ...baseCurrencyConfig.BTC,
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
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.eth) ? [baseCurrencyConfig.ETH] : [],
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.bnb) ? [baseCurrencyConfig.BNB] : [],
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.matic) ? [baseCurrencyConfig.MATIC] : [],
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.arbeth) ? [baseCurrencyConfig.ARBETH] : [],
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.aureth) ? [baseCurrencyConfig.AURETH] : [],
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.xdai) ? [baseCurrencyConfig.XDAI] : [],
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.ftm) ? [baseCurrencyConfig.FTM] : [],
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.avax) ? [baseCurrencyConfig.AVAX] : [],
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.movr) ? [baseCurrencyConfig.MOVR] : [],
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.one) ? [baseCurrencyConfig.ONE] : [],
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.phi_v1) ? [baseCurrencyConfig.PHI_V1] : [],
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.phi) ? [baseCurrencyConfig.PHI] : [],
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.fkw) ? [baseCurrencyConfig.FKW] : [],
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.phpx) ? [baseCurrencyConfig.PHPX] : [],
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.ame) ? [baseCurrencyConfig.AME] : [],
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.ghost) ? [baseCurrencyConfig.GHOST] : [],
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.next) ? [baseCurrencyConfig.NEXT] : [],
    ...(!buildOpts.blockchainSwapEnabled || buildOpts.blockchainSwapEnabled.btc) ? [baseCurrencyConfig.BTC] : [],
    ...tokenPartialItems,
  ],
  addSelectedItems: [],
  addPartialItems: [],
}

if (config.isWidget) {
  initialState.items = [
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.eth) ? [baseCurrencyConfig.ETH] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.bnb) ? [baseCurrencyConfig.BNB] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.matic) ? [baseCurrencyConfig.MATIC] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.arbeth) ? [baseCurrencyConfig.ARBETH] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.aureth) ? [baseCurrencyConfig.AURETH] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.xdai) ? [baseCurrencyConfig.XDAI] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.ftm) ? [baseCurrencyConfig.FTM] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.avax) ? [baseCurrencyConfig.AVAX] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.movr) ? [baseCurrencyConfig.MOVR] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.one) ? [baseCurrencyConfig.ONE] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.phi_v1) ? [baseCurrencyConfig.PHI_V1] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.phi) ? [baseCurrencyConfig.PHI] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.fkw) ? [baseCurrencyConfig.FKW] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.phpx) ? [baseCurrencyConfig.PHPX] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.ame) ? [baseCurrencyConfig.AME] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.btc) ? [baseCurrencyConfig.BTC] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.ghost) ? [baseCurrencyConfig.GHOST] : [],
    ...(!buildOpts.curEnabled || buildOpts.curEnabled.next) ? [baseCurrencyConfig.NEXT] : [],
  ]
  // leave only coins
  initialState.partialItems = initialState.partialItems.filter((item) => !item.standard)

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
    const tokensAreAvailable =
      TOKEN_STANDARDS[standard] && Object.keys(customTokenConfig[standard]).length

    if (tokensAreAvailable) {
      const baseCurrency = TOKEN_STANDARDS[standard]?.currency

      Object.keys(customTokenConfig[standard]).forEach((tokenContractAddr) => {
        const { symbol } = customTokenConfig[standard][tokenContractAddr]
        const itemConfig = {
          name: symbol.toUpperCase(),
          title: symbol.toUpperCase(),
          icon: symbol,
          value: `{${baseCurrency.toUpperCase()}}${symbol}`,
          fullTitle: config[standard][symbol]?.fullName || symbol,
          blockchain: BLOCKCHAIN_TYPE[baseCurrency.toUpperCase()],
          standard,
        }

        initialState.items.push({
          ...itemConfig,
          addAssets: true,
        })
        initialState.partialItems.push(itemConfig)
      })
    }
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
