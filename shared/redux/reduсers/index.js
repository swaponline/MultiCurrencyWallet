import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import history, * as fromHistory from './history'
import filter from './filter'
import wallets from './wallets'
import modals from './modals'
import loader from './loader'

export default combineReducers({
    loader,
    history,
    filter,
    wallets,
    modals,
    router: routerReducer
});

export function getFilteredHistory(state) {
    return fromHistory.getFilteredHistory(state.history, state.filter)
}