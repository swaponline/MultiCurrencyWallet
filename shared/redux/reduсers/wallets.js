import { fromJS } from 'immutable'

export const initialState = fromJS({
  fetching: true,
  wallet: [],
})

// export const getWalletsRequest = (state, payload) =>
//   state.set('fetching', false)

export const setWallets = (state, payload) =>
  state.set('wallet', fromJS(payload))

