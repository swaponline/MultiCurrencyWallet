import 'bootstrap'
import './../client/scss/app.scss'
import 'font-awesome/scss/font-awesome.scss'
import './../client/scss/normalize.scss'

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import routes from '../routes/routes'

import User from '../instances/user'
// import data from './../bin/history.json'
import configureStore, { history } from '../store/configureStore'
import { addWallet, getHistory } from "../actions"

import App from './../components/App/App'

const store = configureStore()

// todo REFACTOR
import getWalletsData from './../logix/wallets'
import UserTooltip from '../components/UserTooltip/UserTooltip';
let dataWallets = getWalletsData()
console.log(dataWallets)
store.dispatch(addWallet(dataWallets))

User.sign()
User.getTransactions()

render(
    <Provider store={store}>
        <App history={history}>
            { routes } 
        </App>
    </Provider>,
    document.getElementById('app')
);