import { wrapReducers } from 'redaction'
import reducers from 'redux/reducers'
import store from 'redux/store'


export default wrapReducers(reducers, store.dispatch)
