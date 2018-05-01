import React from 'react';
import FlipSvg from './flip.svg';

import './SearchTrade.scss'

import TradePanel from '../TradePanel/TradePanel'

const SearchTrade = () => (
    <div className="search-trade">
        <div className="container">
            <div className="trade-panel trade-panel_row">
                <TradePanel 
                    className="trade-panel__want_row trade-panel__want"
                    name="You want"
                    icon="icon-btc"
                    currency="BTC"
                    row="trade-panel__group_row"
                />
                <a href="#" className="trade-panel__change"><img src={FlipSvg} alt="" /></a>

                <TradePanel 
                    className="trade-panel__have_row trade-panel__have"
                    name="You have"
                    icon="icon-eth"
                    currency="ETH"
                    row="trade-panel__group_row"
                />
                <a href="#" className="trade-panel__search">Search</a>
            </div>
        </div>
    </div>
);
    
export default SearchTrade