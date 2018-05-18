import React from 'react'
import PropTypes from 'prop-types'
import FlipIcon from './flip.svg'

import CSSModules from 'react-css-modules'
import styles from './AddOffer.scss'

import TradePanel from '../../TradePanel/TradePanel'

function AddOffer({ next }) {
  return (
    <div styleName="offer-popup__form">
      <h2 styleName="offer-popup__title">Add offer</h2>
      <div styleName="trade-panel trade-panel_offer">
        <TradePanel
          className="trade-panel__want"
          styleName="trade-panel__want_offer"
          name="You want"
          currency="BTC"
        />
        <a href="#" styleName="trade-panel__change">
          <img src={FlipIcon} alt="" />
        </a>
        <TradePanel
          className="trade-panel__have"
          styleName="trade-panel__have_offer"
          name="You sell"
          currency="ETH"
        />
        <a href="#" styleName="trade-panel__next" onClick={next}>Next</a>
      </div>
    </div>
  )
}

AddOffer.propTypes = {
  next: PropTypes.func.isRequired,
}

export default CSSModules(AddOffer, styles, { allowMultiple: true })

