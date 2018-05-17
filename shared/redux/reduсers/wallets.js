import { GET_WALLET, GET_WALLET_REQUEST } from '../constants'

const initialState = {
  fetching: false,
  wallet: [],
}

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_WALLET_REQUEST:
      return { ...state, fetching: true }

    case GET_WALLET:
      return { ...state, wallet: action.payload, fetching: true }

    default:
      return state
  }
}
