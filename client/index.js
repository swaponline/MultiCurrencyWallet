import React from 'react'
import { render } from 'react-dom'

import routes from '../shared/routes/routes'
import configureStore, { history } from '../shared/redux/store/configureStore'

import RootContainer from '../shared/containers/RootContainer'

import './scss/app.scss'

export const store = configureStore()

// refactor
import { addWallet, updateLoader } from '../shared/redux/actions'
import User from '../shared/instances/user'

User.getData()
.then(data => 
    store.dispatch(addWallet(data)))
User.getTransactions()

// this

render(
    <RootContainer history={history} store={store}>
        { routes } 
    </RootContainer>,
    document.getElementById('root')
)