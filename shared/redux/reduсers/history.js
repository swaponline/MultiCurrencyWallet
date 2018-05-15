import { GET_HISTORY, GET_HISTORY_REQUEST } from '../constants'

const initialState = {
    fetching: false,
    transactions: []
}

export default (state = initialState, action) => {
    switch (action.type) {
        case GET_HISTORY_REQUEST:
            return { ...state, fetching: true }
        
        case GET_HISTORY:
            return { ...state, transactions: action.payload, fetching: true }  
  
        default:
            return state
    }
}

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