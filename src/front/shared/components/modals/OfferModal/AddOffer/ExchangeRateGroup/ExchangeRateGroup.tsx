import React from 'react'

import styles from './ExchangeRateGroup.scss'
import cssModules from 'react-css-modules'
import config from 'app-config'


import Group from '../Group/Group'

const ExchangeRateGroup = ({
  className = null,
  disabled,
  label,
  id,
  inputValueLink,
  placeholder,
  buyCurrency,
  sellCurrency,
}) => (
  <Group
    styleName="exRate"
    className={className}
    label={label}
    id={id}
    disabled={disabled}
    inputValueLink={inputValueLink}
    placeholder={placeholder}
  >
    <span styleName="currencyRatio">
      {(sellCurrency.toUpperCase() === `ETH` && config.binance) ? `BNB` : sellCurrency} / {(buyCurrency.toUpperCase() === `ETH` && config.binance) ? `BNB` : buyCurrency}
    </span>
  </Group>
)

export default cssModules(ExchangeRateGroup, styles)
