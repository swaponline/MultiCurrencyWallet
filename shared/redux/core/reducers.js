import { wrapReducers } from 'redaction'
import reduсers from 'redux/reduсers'
import store from 'redux/store'

export default wrapReducers(reduсers, store.dispatch)

