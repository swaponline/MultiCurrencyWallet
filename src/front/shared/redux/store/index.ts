import { createBrowserHistory } from 'history'
import { createStore, combineReducers } from 'redaction'
import localReducers from 'redux/reducers'
import { selectiveSaver } from 'redux/middleware'
import { createReduxHistoryContext } from 'redux-first-history'


const browserHistory = createBrowserHistory()

const { createReduxHistory, routerMiddleware, routerReducer } = createReduxHistoryContext({
  history: browserHistory,
})

const initialState = (localStorage['redux-store']) ? JSON.parse(localStorage['redux-store']) : {}
const devTools = window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : (v) => v

const _storeConfig = {
  reducers: {
    router: routerReducer,
    ...combineReducers(localReducers),
  },
  middleware: [
    routerMiddleware,
    selectiveSaver,
  ],
  enhancers: [
    devTools,
  ],
  initialState,
}

const store = createStore(_storeConfig)
const history = createReduxHistory(store)

export default store

export {
  history,
}
