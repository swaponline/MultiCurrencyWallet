import { createStore, applyMiddleware } from 'redux'
import { routerMiddleware, push } from 'react-router-redux'
import { browserHistory } from 'react-router'

import reducer from './../redusers'
import promise from 'redux-promise'
import thunk from 'redux-thunk'
import logger from 'redux-logger'

const middleware = routerMiddleware(browserHistory)
const store = createStore(reducer, applyMiddleware(promise, thunk, middleware, logger))

export default store;