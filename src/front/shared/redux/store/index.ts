import { createBrowserHistory } from 'history'
import { createStore, combineReducers } from 'redaction'
import localReducers from 'redux/reducers'
import { selectiveSaver } from 'redux/middleware'
import { connectRouter, routerMiddleware } from 'connected-react-router'


const history = createBrowserHistory()
const middleware = routerMiddleware(history)
const initialState = (localStorage['redux-store']) ? JSON.parse(localStorage['redux-store']) : {}
const devTools = window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : (v) => v

const _storeConfig = {
  reducers: {
    router: connectRouter(history),
    ...combineReducers(localReducers),
  },
  middleware: [
    middleware,
    selectiveSaver,
  ],
  enhancers: [
    devTools,
  ],
  initialState,
}

const store = createStore(_storeConfig)


export default store

export {
  history,
}
