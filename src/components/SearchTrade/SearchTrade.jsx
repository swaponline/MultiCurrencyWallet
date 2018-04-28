import React from 'react';
import FlipSvg from './flip.svg';

import CSSModules from 'react-css-modules'
import styles from './SearchTrade.scss'

import TradePanel from '../TradePanel/TradePanel'

const SearchTrade = () => (
    <div className="search-trade">
        <div className="container">
            <div styleName="trade-panel trade-panel_row">
                <TradePanel 
                    styleName="trade-panel__want_row" 
                    className="trade-panel__want" 
                    name="You want"
                    icon="icon-btc"
                    currency="BTC"
                />
                <a href="#" styleName="trade-panel__change"><img src={FlipSvg} alt="" /></a>

                <TradePanel 
                    styleName="trade-panel__have_row" 
                    className="trade-panel__have" 
                    name="You have"
                    icon="icon-eth"
                    currency="ETH"
                />
                <a href="#" styleName="trade-panel__search">Search</a>
            </div>
        </div>
    </div>
)
    
export default CSSModules(SearchTrade, styles, { allowMultiple: true })