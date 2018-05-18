import React from 'react'
import PropTypes from 'prop-types'

import Title from './Title/Title'
import Input from './Input/Input'

export default function TradePanel({ name, currency, row, styleName, className }) {
  return (
    <div className={`${styleName} ${className}`}>
      <Title name={name} />
      <Input currency={currency} row={row} />
    </div>
  )
}

TradePanel.propTypes = {
  name: PropTypes.string.isRequired,
  currency: PropTypes.string.isRequired,
  row: PropTypes.string,
  styleName: PropTypes.string.isRequired,
}
