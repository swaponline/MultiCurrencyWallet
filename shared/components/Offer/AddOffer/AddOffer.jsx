import React from 'react'
import PropTypes from 'prop-types'
import FlipIcon from './flip.svg'
import './AddOffer.scss'

import TradePanel from '../../TradePanel/TradePanel'

const AddOffer = ({ next }) => (
    <div className="offer-popup__form">
        <h2 className="offer-popup__title">Add offer</h2>
        <div className="trade-panel trade-panel_offer">
            <TradePanel 
                className="trade-panel__want trade-panel__want_offer" 
                name="You want"
                currency="BTC"
            />
            <a href="#" className="trade-panel__change">
                <img src={FlipIcon} alt="" />
            </a>
            <TradePanel 
                className="trade-panel__have trade-panel__have_offer" 
                name="You sell"
                currency="ETH"
            />
            <a href="#" className="trade-panel__next" onClick={ next }>Next</a>
        </div>
    </div>
)

AddOffer.propTypes = {
    next: PropTypes.func.isRequired
}

export default AddOffer