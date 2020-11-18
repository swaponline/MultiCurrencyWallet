export const initialState = {
  transactions: null,
  filter: 'all',
  swapHistory: {},
}

export const setFilter = (state, payload) => ({
  ...state,
  filter: payload,
})

export const setTransactions = (state, payload) => ({
  ...state,
  transactions: [
    ...payload,
  ],
})

export const setSwapHistory = (state, payload) => ({
  ...state,
  swapHistory: payload,
})
