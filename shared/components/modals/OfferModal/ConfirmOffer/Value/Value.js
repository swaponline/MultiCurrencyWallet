import React from 'react'

import cssModules from 'react-css-modules'
import styles from './Value.scss'


const Value = ({ value, currency }) => (
  <span styleName="value">
    <span>{value}{' '}</span>
    <span styleName="currency">{' '}{currency.toUpperCase()}</span>
  </span>
)

export default cssModules(Value, styles)
