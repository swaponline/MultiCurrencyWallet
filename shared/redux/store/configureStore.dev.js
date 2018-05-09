import { createStore, applyMiddleware, compose } from 'redux'
import { routerMiddleware } from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'

import reducer from '../reduсers/index'
import promise from 'redux-promise'
import thunk from 'redux-thunk'
import logger from 'redux-logger'

export const history = createHistory()

const middleware = routerMiddleware(history)

const configureStore = preloadedState => {
    const store = createStore(
        reducer,
        preloadedState,
    compose(
        applyMiddleware(
            promise,
            thunk,
            middleware,
            logger),
      )
    )
  
    if (module.hot) {
      // Enable Webpack hot module replacement for reducers
      module.hot.accept('../reduсers/index', () => {
        store.replaceReducer(reducer)
      })
    }
  
    return store
  }

export default configureStore 