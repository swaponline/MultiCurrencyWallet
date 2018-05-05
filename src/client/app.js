import 'bootstrap';
import './../client/scss/app.scss'
import 'font-awesome/scss/font-awesome.scss'
import './../client/scss/normalize.scss'

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import routes from '../routes/routes'

import data from './../bin/history.json'
import store, { history } from './../redux/store'
import {createAccount, getHistory} from './../redux/actions'

import App from './../components/App/App'

store.dispatch(getHistory(data));
store.dispatch(createAccount());

render(
    <Provider store={store} >
        <App history={history}>
            { routes } 
        </App>
    </Provider>,
    document.getElementById('app')
);