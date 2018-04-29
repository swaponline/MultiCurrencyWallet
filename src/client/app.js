import _ from 'lodash';
import 'bootstrap';
import './../scss/app.scss'
import 'font-awesome/scss/font-awesome.scss';
import '../scss/normalize.scss';
import React from 'react';
import { render } from 'react-dom';
import App from './../components/App/App';

render(
    <App/>,
    document.getElementById('app')
);