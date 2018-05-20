export const initialState = {
  fetching: false,
  transactions: [],
  filter: 'ALL',
}

export const getHistory = (state, payload) => ({
  ...state,
  fetching: true,
  transactions: payload,
})

export const setFilter = (state, payload) => ({
  ...state,
  filter: payload,
})

