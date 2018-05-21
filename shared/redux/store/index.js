import { routerMiddleware } from 'react-router-redux'
import { createBrowserHistory } from 'history'
import { createStore, combineReducers } from 'redaction'
import { createLogger } from 'redux-logger'
import promise from 'redux-promise'
import localReducers from 'redux/reduсers'
// import { saver } from 'redux/middleware'


export const history = createBrowserHistory()
const middleware = routerMiddleware(history)
const initialState = (localStorage['redux-store']) ? JSON.parse(localStorage['redux-store']) : {}

const store = createStore({
  reducers: {
    ...combineReducers(localReducers),
  },
  middleware: [
    promise,
    middleware,
    createLogger(),
  ],
  initialState,
})


export default store
