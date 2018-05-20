export const initialState = {
  fetching: false,
  wallet: [],
}

export const setWallets = (state, payload) => ({
  ...state,
  fetching: true,
  wallet: payload,
})

