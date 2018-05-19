import { fromJS } from 'immutable'
import { routerMiddleware } from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'
import { createStore, combineReducers } from 'redaction/immutable'
import localReducers from '../reduсers'

import promise from 'redux-promise'
import { createLogger } from 'redux-logger'
import { saver } from '../middleware'

export const history = createHistory()
const middleware = routerMiddleware(history)
const initialState = fromJS((localStorage['redux-store']) ? JSON.parse(localStorage['redux-store']) : {})

console.log(initialState.toJS())

const store = createStore({
  reducers: {
    ...combineReducers(localReducers),
  },
  middleware: [
    promise,
    middleware,
    saver,
    createLogger(),
  ],
  initialState,
})

export default store
