import _ from 'lodash';

import 'bootstrap';
import './../client/scss/app.scss'
import 'font-awesome/scss/font-awesome.scss';
import './../client/scss/normalize.scss';

import React from 'react';
import { render } from 'react-dom';
import App from './../components/App/App';

import history from './../bin/history.json'
import { Provider } from 'react-redux'
import store from './../redux/store'
import { getHistory } from './../redux/actions'

store.dispatch(getHistory(history))

render(
    <Provider store={store}>
        <App/>
    </Provider>,
    document.getElementById('app')
);