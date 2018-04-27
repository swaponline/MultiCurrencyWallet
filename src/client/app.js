import _ from 'lodash';
import './../css/normalize.css';
import './../css/boot.css';
import './../css/all.css';
import React from 'react';
import { render } from 'react-dom';
import App from './../components/App/App'

render(
    <App/>,
    document.getElementById('app')
);