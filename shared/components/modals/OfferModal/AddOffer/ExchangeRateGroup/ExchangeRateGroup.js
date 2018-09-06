import React from 'react'

import styles from './ExchangeRateGroup.scss'
import cssModules from 'react-css-modules'

import Group from '../Group/Group'


const ExchangeRateGroup = ({ className, disabled, label, id, inputValueLink, placeholder, buyCurrency, sellCurrency }) => (
  <Group
    className={className}
    label={label}
    id={id}
    disabled={disabled}
    inputValueLink={inputValueLink}
    placeholder={placeholder}>
    <span styleName="currencyRatio">{sellCurrency} / {buyCurrency}</span>
  </Group>
)

export default cssModules(ExchangeRateGroup, styles)
