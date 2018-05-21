export const initialState = {
  transactions: [],
  filter: 'ALL',
}

export const setFilter = (state, payload) => ({
  ...state,
  filter: payload,
})

export const setTransactions = (state, payload) => ({
  ...state,
  transactions: [
    ...state.transactions,
    payload,
  ],
})
