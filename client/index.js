import React from 'react'
import { render } from 'react-dom'

import routes from '../shared/routes/routes'
import configureStore, { history } from '../shared/redux/store/configureStore'

import Root from '../shared/containers/Root'

import './scss/app.scss'

export const store = configureStore()

// refactor
import { addWallet } from '../shared/redux/actions'
import User from '../shared/instances/user'
User.getData()
    .then(data => 
        store.dispatch(addWallet(data)))
User.getTransactions()
// this

render(
    <Root history={history} store={store}>
        { routes } 
    </Root>,
    document.getElementById('root')
)