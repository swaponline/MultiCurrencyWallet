import React from 'react'
import PropTypes from 'prop-types'
import './ConfirmOffer.scss'

import Coin from './Coin/Coin'
import Exchange from './Exchange/Exchange'
import Rating from './Rating/Rating'
import Gas from './Gas/Gas'
import Button from './Button/Button'

export default function ConfirmOffer({ back }) {
  return (
    <div className="offer-popup__form">
      <h2 className="offer-popup__title">Confirm</h2>
      <div className="confirm">
        <Coin />
        <Exchange />
        <Rating />
        <Gas />
        <Button back={back} />
      </div>
    </div>
  )
}

ConfirmOffer.propTypes = {
  back: PropTypes.func.isRequired,
}

