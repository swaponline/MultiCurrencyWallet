import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"

import Header from './Header';
import All from './All'
import Balances from './Balances'
import NotFound from './NotFound'

class App extends Component {
    render() {
        return (
            <Router>
                <main className="main" id="main">
                    <Header/>
                    <Switch>
                        <Route exact path="/" component={ All } />
                        <Route path="/balance" component={ Balances } />
                        <Route component={ NotFound } />
                    </Switch>
                </main>
            </Router>
        )
    }
}

export default App