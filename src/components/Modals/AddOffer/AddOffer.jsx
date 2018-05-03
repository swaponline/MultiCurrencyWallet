import React from 'react'

import './AddOffer.scss'

import TradePanel from '../../TradePanel/TradePanel'

const AddOffer = () => {
    return(
        <div className="offer-popup__form">
            <h2 className="offer-popup__title">Add offer</h2>
            <div className="trade-panel trade-panel_offer">
                <TradePanel 
                    className="trade-panel__want " 
                    className="trade-panel__want_offer"
                    name="You want"
                    icon="icon-btc"
                    currency="BTC"
                />
                <a href="#" className="trade-panel__change">
                    <img src="img/flip.svg" alt="" />
                </a>
                <TradePanel 
                    className="trade-panel__have" 
                    className="trade-panel__have_offer"
                    name="You sell"
                    icon="icon-eth"
                    currency="ETH"
                />
                <a href="#" className="trade-panel__next" >Next</a>
            </div>
        </div>)
}

export default AddOffer