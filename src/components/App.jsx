import React, { Component } from 'react';
import Header from './Header';
import Description from './Description';
import SearchTrade from './SearchTrade';
import TradesTable from "./TradesTable";

class App extends Component {
    render() {
        return (
            <main className="main">
                <Header/>
                <Description/>
                <SearchTrade/>
                <TradesTable/>
            </main>
        )
    }
}

export default App