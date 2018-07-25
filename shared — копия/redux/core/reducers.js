import { wrapReducers } from 'redaction'
import reducers from 'redux/reduсers'
import store from 'redux/store'


export default wrapReducers(reducers, store.dispatch)
