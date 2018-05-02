import _ from 'lodash';

import 'bootstrap';
import './../client/scss/app.scss'
import 'font-awesome/scss/font-awesome.scss'
import './../client/scss/normalize.scss'

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import data from './../bin/history.json'
import store from './../redux/store'
import { createBrowserHistory } from 'history'
import { syncHistoryWithStore } from 'react-router-redux'
import { getHistory } from './../redux/actions'

import App from './../components/App/App'

store.dispatch(getHistory(data))
const history = syncHistoryWithStore(createBrowserHistory(), store)

render(
    <Provider store={store} >
        <App history={history}/>
    </Provider>,
    document.getElementById('app')
);