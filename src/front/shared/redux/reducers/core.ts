import config from 'app-config'


export const initialState = {
  orders: [],
  filter: 'btc-swap',
  hiddenCoinsList: JSON.parse(localStorage.getItem('hiddenCoinsList') || '""') || config.hiddenCoins,
}

export const getOrders = (state, { orders }) => ({
  ...state,
  orders,
})

export const setFilter = (state, { filter }) => ({
  ...state,
  orders: [
    ...state.orders,
  ],
  filter,
})

export const markCoinAsHidden = (state, coin) => ({
  ...state,
  hiddenCoinsList: [
    ...state.hiddenCoinsList,
    coin,
  ],
})

export const markCoinAsVisible = (state, coin) => ({
  ...state,
  hiddenCoinsList: state.hiddenCoinsList.filter(c => c !== coin),
})
