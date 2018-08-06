import React from 'react'

import styles from './ExchangeRateGroup.scss'
import cssModules from 'react-css-modules'

import Group from '../Group/Group'


const ExchangeRateGroup = ({ className, label, id, inputValueLink, placeholder, buyCurrency, sellCurrency }) => (
  <Group
    className={className}
    label={label}
    id={id}
    inputValueLink={inputValueLink}
    placeholder={placeholder}>
    <span styleName="currencyRatio">{buyCurrency} / {sellCurrency}</span>
  </Group>
)

export default cssModules(ExchangeRateGroup, styles)
