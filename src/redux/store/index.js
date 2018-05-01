import { createStore, applyMiddleware } from 'redux';
import reducer from './../redusers';
import promise from 'redux-promise';
import thunk from 'redux-thunk';
import logger from 'redux-logger';

const store = createStore(reducer, applyMiddleware(promise, thunk, logger));

export default store;