import React, { Component } from 'react'
import { BrowserRouter, Route, Switch } from "react-router-dom"
import './App.scss'

import Header from '../Header/Header'

import NotFound from '../NotFound/NotFound'
import Offer from '../Modals/Offer/Offer'

import Balances from '../../pages/Balances'
import History from '../../pages/History'
import Main from '../../pages/Main'

class App extends Component {

    constructor() {
        super()

        this.state = {
            visible: false
        }

        this.handleChange = this.handleChange.bind(this)
    }

    handleChange() {
        this.setState({ visible: !this.state.visible })
    }

    render() {
        const { history } = this.props
        return (
            <BrowserRouter history={history}>
                <main className="main" id="main">
                    { this.state.visible ? <Offer isClose={this.handleChange}/> : '' }
                    <Header isOpen={this.handleChange}/>
                    <Switch>
                        <Route exact path="/" component={ Main } />
                        <Route path="/balance" component={ Balances } />
                        <Route path="/history" component={ History } />
                        <Route component={ NotFound } />
                    </Switch>
                </main>
            </BrowserRouter>
        )
    }
};

export default App