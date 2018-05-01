import { GET_HISTORY } from '../actions';

export default function reducer(state = [], action) {
    switch (action.type) {
        case GET_HISTORY:
            return action.history;

        default:
            return state;
    }
}

export function getFilteredHistory(state, filter) {
    switch (filter) {
        case 'ALL':
            return state;
        
        case 'SENT':
            return state.filter(history => history.classSent);

        case 'RECEIVED':
            return state.filter(history => !history.classSent);

        default:
            return state;
    }
}