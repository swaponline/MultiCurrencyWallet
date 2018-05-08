import { GET_HISTORY } from '../actions/index';

export default (state = [], action) => {
    switch (action.type) {
        case GET_HISTORY:
           return action.history

        default:
            return state
    }
}

export const getFilteredHistory = (state, filter) => {
    switch (filter) {
        case 'ALL':
            return state

        case 'SENT':
            return state.filter(h => h.type === 'in')

        case 'RECEIVED':
            return state.filter(h => h.type === 'out')

        default:
            return state
    }
}