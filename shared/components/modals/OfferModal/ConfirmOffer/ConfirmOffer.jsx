import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './ConfirmOffer.scss'

import Coin from './Coin/Coin'
import Exchange from './Exchange/Exchange'
import Rating from './Rating/Rating'
import Gas from './Gas/Gas'
import Button from './Button/Button'


function ConfirmOffer({ back }) {
  return (
    <div styleName="offer-popup__form">
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

export default CSSModules(ConfirmOffer, styles)
