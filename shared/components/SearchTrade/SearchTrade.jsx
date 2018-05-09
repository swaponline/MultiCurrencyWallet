import React from 'react'
import './SearchTrade.scss'

import Flip from '../controls/Flip/Flip'
import Button from '../controls/Button/Button'
import TradePanel from '../TradePanel/TradePanel'

const SearchTrade = () => (
    <div className="search-trade">
        <div className="container">
            <div className="trade-panel trade-panel_row">
                <TradePanel 
                    className="trade-panel__want_row trade-panel__want"
                    row="trade-panel__group_row"
                    name="You want"
                    currency="BTC"
                />
                <Flip />

                <TradePanel 
                    className="trade-panel__have_row trade-panel__have"
                    row="trade-panel__group_row"
                    name="You have"
                    currency="ETH"
                />
                <Button className="trade-panel__search" text="Search" />
            </div>
        </div>
    </div>
);
    
export default SearchTrade