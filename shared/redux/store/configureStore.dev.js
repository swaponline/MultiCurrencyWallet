import { createStore, applyMiddleware } from 'redux'
import { routerMiddleware } from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'

import reducers from '../reduсers'
import promise from 'redux-promise'
import thunk from 'redux-thunk'
import { createLogger } from 'redux-logger'
import { saver } from '../middleware'

export const history = createHistory()

const middleware = routerMiddleware(history)

const initialState = (localStorage['redux-store']) ? 
JSON.parse(localStorage['redux-store']) : {}

export default function configureStore(initialState) {
	const store = createStore(
		reducers,
		initialState,
		applyMiddleware(
			promise, 
			thunk, 
			middleware, 
			saver, 
			createLogger()
		)
	)

	return store
}

