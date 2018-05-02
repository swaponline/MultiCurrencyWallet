import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import history, * as fromHistory from './history'
import filter from './filter'

const reducer = combineReducers({
    history,
    filter,
    routing: routerReducer
})

export default reducer

export function getFilteredHistory(state) {
    return fromHistory.getFilteredHistory(state.history, state.filter);
}