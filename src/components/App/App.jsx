import React from 'react'
import { ConnectedRouter } from 'react-router-redux'
import './App.scss'

import Header from '../Header/Header'

const App = ({ history, children }) => (
    <ConnectedRouter history={history}>
        <main className="main" id="main">
            <Header />
            { children }
        </main>
    </ConnectedRouter>
)
export default App