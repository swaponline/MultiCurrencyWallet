import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './AddOffer.scss'

import TradePanel from '../../TradePanel/TradePanel'

function AddOffer({ isNext }) {
    function Next(event) {
        event.preventDefault()
        isNext()
    }
    return(
        <div styleName="offer-popup__form">
            <h2 styleName="offer-popup__title">Add offer</h2>
            <div styleName="trade-panel trade-panel_offer">
                <TradePanel 
                    className="trade-panel__want " 
                    styleName="trade-panel__want_offer" 
                    name="You want"
                    icon="icon-btc"
                    currency="BTC"
                />
                <a href="#" styleName="trade-panel__change">
                    <img src="img/flip.svg" alt="" />
                </a>
                <TradePanel 
                    className="trade-panel__have" 
                    styleName="trade-panel__have_offer" 
                    name="You sell"
                    icon="icon-eth"
                    currency="ETH"
                />
                <a href="#" styleName="trade-panel__next" onClick={ Next }>Next</a>
            </div>
        </div>
    )
}

export default CSSModules(AddOffer, styles,{ allowMultiple: true })