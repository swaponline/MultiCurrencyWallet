import { routerMiddleware } from 'react-router-redux'
import { createBrowserHistory } from 'history'
import { createStore, combineReducers } from 'redaction'
import { createLogger } from 'redux-logger'
import localReducers from 'redux/reduсers'


export const history = createBrowserHistory()
const middleware = routerMiddleware(history)
const initialState = {} // (localStorage['redux-store']) ? JSON.parse(localStorage['redux-store']) : {}


const store = createStore({
  reducers: {
    ...combineReducers(localReducers),
  },
  middleware: [
    middleware,
  ].concat(process.env.NODE_ENV === 'production' ? [] : [
    createLogger(),
  ]),
  initialState,
})


export default store
