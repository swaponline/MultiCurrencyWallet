import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import history, * as fromHistory from './history'
import filter from './filter'
import wallets from './wallets'
import modals from './modals'
import loader from './loader'
import notification from './notification'

const reducers =  combineReducers({ 
    router: routerReducer,
    notification, 
    loader, 
    history, 
    filter,
    wallets,
    modals
})

export function getFilteredHistory(state) {
    return fromHistory.getFilteredHistory(state.history.transactions, state.filter)
}

export default reducers