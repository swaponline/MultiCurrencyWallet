import { combineReducers } from 'redux'

import history, * as fromHistory from './history'
import filter from './filter'

const reducer = combineReducers({
    history,
    filter
})

export default reducer

export function getFilteredHistory(state) {
    return fromHistory.getFilteredHistory(state.history, state.filter);
}