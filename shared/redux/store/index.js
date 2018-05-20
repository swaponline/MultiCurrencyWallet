import { routerMiddleware } from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'
import { createStore, combineReducers } from 'redaction'
import localReducers from '../reduсers'

import promise from 'redux-promise'
import { createLogger } from 'redux-logger'
import { saver } from '../middleware'

export const history = createHistory()
const middleware = routerMiddleware(history)
const initialState = (localStorage['redux-store']) ? JSON.parse(localStorage['redux-store']) : {}

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
