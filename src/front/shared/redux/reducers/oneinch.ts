import config from 'app-config'

export type OrderData = {
  makerAsset: string
  takerAsset: string
  getMakerAmount: string
  getTakerAmount: string
  makerAssetData: string
  takerAssetData: string
  salt: string
  permit: string
  predicate: string
  interaction: string
}

export type Order = {
  makerAmount: string
  takerAmount: string
  signature: string
  orderHash: string
  createDateTime: string
  orderMaker: string
  remainingMakerAmount: string
  makerBalance: string
  makerAllowance: string
  data: OrderData
  makerRate: string
  takerRate: string
}

interface State {
  blockchains: {
    // chain id
    [k: string]: {
      baseCurrency: string
    }
  }
  orders: {
    [k: string]: Order[]
  }
}

const blockchains = {}
const allowedCurrency = ['ETH', 'BNB', 'MATIC', 'XDAI', 'AVAX']

Object.keys(config.evmNetworks)
  .filter((currency) => allowedCurrency.includes(currency))
  .forEach((currency) => {
    const chainId = config.evmNetworks[currency].networkVersion

    blockchains[chainId] = config.evmNetworks[currency]
  })

export const initialState: State = {
  blockchains,
  orders: {},
}

export const addOrder = (state, { chainId, order }) => {
  const orders = {
    ...state.orders,
    [chainId]: [...state.orders[chainId], order],
  }

  return {
    ...state,
    orders,
  }
}

export const addOrders = (state, { chainId, orders }) => {
  const ordersByChain: Order[] = []

  if (state.orders[chainId]) {
    ordersByChain.push(...state.orders[chainId])
  }

  ordersByChain.push(...orders)

  return {
    ...state,
    orders: {
      ...state.orders,
      [chainId]: ordersByChain,
    },
  }
}

export const removeOrder = (state, { chainId, index }) => {
  const ordersByChain: Order[] = []

  if (state.orders[chainId]) {
    ordersByChain.push(...state.orders[chainId])
  }

  ordersByChain.splice(index, 1)

  return {
    ...state,
    orders: {
      ...state.orders,
      [chainId]: ordersByChain,
    },
  }
}

export const getOrders = (state, { orders }) => ({
  ...state,
  orders,
})
