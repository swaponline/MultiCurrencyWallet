import React from 'react'
import PropTypes from 'prop-types'

import Title from './Title/Title'
import Input from './Input/Input'

export default function TradePanel({ name, currency, row, className }) {
  return (
    <div className={className} >
      <Title name={name} />
      <Input currency={currency} row={row} />
    </div>
  )
}

TradePanel.propTypes = {
  name: PropTypes.string.isRequired,
  currency: PropTypes.string.isRequired,
  row: PropTypes.string,
  className: PropTypes.string.isRequired,
}

