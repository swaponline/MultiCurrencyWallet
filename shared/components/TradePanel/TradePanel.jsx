import React from 'react'
import PropTypes from 'prop-types'
import './TradePanel.scss'

import Title from './Title/Title'
import Input from './Input/Input'

const TradePanel = ({ name, currency, row, className }) => (
  <div className={className} >
    <Title name={name} />
    <div className="trade-panel__group">
      <input type="number" placeholder="0" className="trade-panel__input" />
      <div className="trade-panel__label trade-panel__label_row">
        <label className="btn-group trade-panel__select">
          <span className="trade-panel__icon icon-btc" />
          <select
            className="trade-panel__search-field"
            dir="rtl"
          >
            <option className="dropdown-item"><span className="trade-panel__icon icon-btc" /> BTC</option>
            <option className="dropdown-item"><span className="trade-panel__icon icon-eth" /> ETH</option>
          </select>
        </label>
      </div>
    </div>
  </div>
)

TradePanel.propTypes = {
  name: PropTypes.string.isRequired,
  currency: PropTypes.string.isRequired,
  row: PropTypes.string,
  className: PropTypes.string.isRequired,
}

export default TradePanel
