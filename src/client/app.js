import _ from 'lodash';
import 'bootstrap';
import './../scss/main.scss';
import './../scss/normalize.scss';
import React from 'react';
import { render } from 'react-dom';
import App from './../components/App'

render(
    <App/>,
    document.getElementById('app')
);