import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './Input.scss'

function Input({ currency, row = '' }) {
  return (
    <div styleName={`trade-panel__group ${row}`}>
      {/* <input type="number" placeholder="0" className="trade-panel__input" /> */}
      <select name="" id="" styleName="trade-panel__select" defaultValue={currency}>
        <option value="ETH">ETH</option>
        <option value="BTC">BTC</option>
      </select>
    </div>
  )
}

Input.propTypes = {
  currency: PropTypes.string.isRequired,
  row: PropTypes.string,
}

export default CSSModules(Input, styles, { allowMultiple: true })
