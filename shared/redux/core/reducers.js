import { wrapReducers } from 'redaction'
import reduсers from '../reduсers'
import store from '../store'

export default wrapReducers(reduсers, store.dispatch)

