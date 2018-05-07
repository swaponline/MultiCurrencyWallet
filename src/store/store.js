import { createStore, applyMiddleware } from 'redux'
import { routerMiddleware } from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'

import reducer from '../reduсers/index'
import promise from 'redux-promise'
import thunk from 'redux-thunk'
import logger from 'redux-logger'

export const history = createHistory()

const middleware = routerMiddleware(history)

const store = createStore(
    reducer,
    applyMiddleware(
        promise,
        thunk,
        middleware,
        logger
    )
)

export default store