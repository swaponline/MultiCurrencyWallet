import { fromJS } from 'immutable'

export const initialState = {
  fetching: true,
  transactions: [],
}

// export const getHistoryRequest = (state, payload) =>
//   state.set('fetching', false)

export const getHistory = (state, payload) =>
  state.set('transactions', fromJS(payload))

export const getFilteredHistory = (state, filter) => {
  switch (filter) {
    case 'ALL':
      return state

    case 'SENT':
      return state.filter(h => h.direction === 'in')

    case 'RECEIVED':
      return state.filter(h => h.direction === 'out')

    default:
      return state
  }
}
