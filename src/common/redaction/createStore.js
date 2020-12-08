import { applyMiddleware, compose, combineReducers, createStore as reduxCreateStore } from 'redux'
import { resolveDispatch } from './dispatchReducers'


const createStore = (props) => {
  console.log('>>>>>>>>>> CREATE STORE')
  const {
    initialState = {},
    reducers = {},
    middleware = [],
    enhancers = [],
  } = props

  console.log('>>> createStore', middleware)

  console.log('args', reducers)
  const arg1 = combineReducers(reducers)
  console.log('>>> ARG1', arg1)
  const store = reduxCreateStore(
    arg1,
    initialState,
    compose(
      applyMiddleware(...middleware),
      ...enhancers,
    ),
  )

  resolveDispatch(store.dispatch)

  return store
}


export default createStore
