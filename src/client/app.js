import 'bootstrap'
import './../client/scss/app.scss'
import 'font-awesome/scss/font-awesome.scss'
import './../client/scss/normalize.scss'

import React from 'react'
import { render } from 'react-dom'
import routes from '../routes/routes'
import configureStore, { history } from '../store/store'

import App from './../components/App/App'

const store = configureStore()

// refactor
import { addWallet, getHistory } from '../actions'
import User from '../instances/user'
User.getData()
    .then(data => 
        store.dispatch(addWallet(data)))
User.getTransactions()
// this

render(
    <App history={history} store={store}>
        { routes } 
    </App>,
    document.getElementById('app')
)