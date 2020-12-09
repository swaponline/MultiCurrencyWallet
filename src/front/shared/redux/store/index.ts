import { createBrowserHistory } from 'history'
import { createStore, combineReducers } from 'redaction'
import { createLogger } from 'redux-logger'
import localReducers from 'redux/reducers'
import { selectiveSaver } from 'redux/middleware'
import { connectRouter } from 'connected-react-router'
import { combineReducers as reduxCombineReducers } from 'redux'
import { routerMiddleware } from 'connected-react-router'


const history = createBrowserHistory()
// @ts-ignore
history.isSame = true
console.log('>>>> init redux', history)
const middleware = routerMiddleware(history)
const initialState = (localStorage['redux-store']) ? JSON.parse(localStorage['redux-store']) : {}
const devTools = window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : (v) => v

console.log('>>>>>>>>>>>>>>>> INITIAL STATE', initialState)
const _storeConfig = {
  reducers: {
    router: connectRouter(history),
    ...combineReducers(localReducers),
  },
  middleware: [
  /*
    middleware,
    selectiveSaver,
    */
  ].concat(process.env.NODE_ENV === 'production' ? [] : [
    // createLogger(),
  ]),
  enhancers: [
    devTools,
  ],
  initialState,
}
console.log('_________________---', _storeConfig)

const store = createStore(_storeConfig)


export default store

export {
  history,
}
