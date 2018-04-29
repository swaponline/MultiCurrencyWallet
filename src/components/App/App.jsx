import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"

import CSSModules from 'react-css-modules'
import styles from './App.scss'

import Header from '../Header/Header'
import Balances from '../Balances/Balances'
import TradesTable from '../TradesTable/TradesTable'
import Description from '../Description/Description'
import SearchTrade from '../SearchTrade/SearchTrade'
import NotFound from '../NotFound/NotFound'
import Offer from '../Modals/Offer/Offer'
import History from '../History/History'

const titles = ['EXCHANGE','PRICE','LIMITS','RATING']

class App extends Component {

    constructor(){
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
        return (
            <Router>
                <main styleName="main" id="main">
                    { this.state.visible ? <Offer isClose={this.handleChange}/> : '' }
                    <Header isOpen={this.handleChange}/>
                    <Switch>
                        <Route exact path="/" >
                            <section>
                                <Description subtitle="Instant BTC for ETH and ERC20, p2p exchange without commission" title="SWAP.ONLINE" /> 
                                <SearchTrade /> 
                                <TradesTable titles={titles} body={true}/>
                            </section>
                        </Route>
                        <Route path="/balance" component={ Balances } />
                        <Route path="/history" component={ History } />
                        <Route component={ NotFound } />
                    </Switch>
                </main>
            </Router>
        )
    }
}

export default CSSModules(App, styles)