import React from 'react'
import { ConnectedRouter } from 'react-router-redux'
import { Provider } from 'react-redux'
import PropTypes from 'prop-types'

import Header from '../components/Header/Header'
import ModalsContainer from './ModalsContainer'

const Root = ({ history, children, store }) => (
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <main className="main" id="main">
                <Header />
                { children }
                <ModalsContainer />
            </main>
        </ConnectedRouter>
    </Provider>
);

Root.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired
}

export default Root