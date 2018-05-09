import React from 'react'

import './ConfirmOffer.scss'

import Coin from './Coin/Coin'
import Exchange from './Exchange/Exchange'
import Rating from './Rating/Rating'
import Gas from './Gas/Gas'
import Button from './Button/Button'

const ConfirmOffer = ({ back }) => (
    <div className="offer-popup__form">
        <h2 className="offer-popup__title">Confirm</h2>
        <div className="confirm">
            <Coin />
            <Exchange />
            <Rating />
            <Gas />
            <Button back={back}/>
        </div> 
    </div>
)

export default ConfirmOffer
