import 'bootstrap'
import './../client/scss/app.scss'
import 'font-awesome/scss/font-awesome.scss'
import './../client/scss/normalize.scss'

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import routes from '../routes/routes'

import User from '../instances/user'
import store, { history } from '../store/store'
import { addWallet, getHistory } from '../actions'

import App from './../components/App/App'

User.getData()
    .then(data => 
        store.dispatch(addWallet(data)))

render(
    <Provider store={store}>
        <App history={history}>
            { routes } 
        </App>
    </Provider>,
    document.getElementById('app')
);