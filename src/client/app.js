import 'bootstrap';
import './../client/scss/app.scss'
import 'font-awesome/scss/font-awesome.scss'
import './../client/scss/normalize.scss'

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import routes from '../routes/routes'

import data from './../bin/history.json'
import configureStore, { history } from '../store/configureStore'
import {addWallet, getHistory} from "../actions";

import App from './../components/App/App'

const store = configureStore()

store.dispatch(getHistory(data))

// todo REFACTOR
import getWalletsData from './../logix/wallets'
let dataWallets = getWalletsData()
console.log(dataWallets)
store.dispatch(addWallet(dataWallets))

render(
    <Provider store={store}>
        <App history={history}>
            { routes } 
        </App>
    </Provider>,
    document.getElementById('app')
);