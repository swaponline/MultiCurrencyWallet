export const initialState = {
  transactions: [],
  filter: 'all',
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
