import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import history, * as fromHistory from './history'
import filter from './filter'
import account from './account'
import modals from './modals'

const reducer = combineReducers({
    history,
    filter,
    account,
    modals,
    router: routerReducer
})

export default reducer

export function getFilteredHistory(state) {
    return fromHistory.getFilteredHistory(state.history, state.filter);
}