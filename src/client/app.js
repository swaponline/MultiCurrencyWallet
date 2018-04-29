import _ from 'lodash';
import 'bootstrap';
import 'font-awesome/scss/font-awesome.scss';
import '../css/normalize.css';
import '../css/all.css';
import React from 'react';
import { render } from 'react-dom';
import App from './../components/App/App'
import './../scss/app.scss'

render(
    <App/>,
    document.getElementById('app')
);