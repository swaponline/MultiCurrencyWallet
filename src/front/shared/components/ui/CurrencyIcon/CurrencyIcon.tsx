import React from 'react'
import cssModules from 'react-css-modules'
import styles from './CurrencyIcon.scss'

import icons from './images'
import { FormattedMessage } from 'react-intl'
import config from 'app-config'


export const iconNames = Object.keys(icons)


type CurrencyIconProps = {
  style?: { [key: string]: string }
  className?: string
  name: string
}

const CurrencyIcon = (props: CurrencyIconProps) => {
  const { className, style, name } = props

  if (typeof name === 'undefined') {
    return <p><FormattedMessage id="currencyIcon15" defaultMessage="Error" /></p>
  }
  const isIconExist = iconNames.includes(name.toLowerCase())

  if (config.binance && name.toLowerCase() === `eth`) name = `bnb`
  if (config
    && config.erc20
    && config.erc20[name.toLowerCase()]
    && config.erc20[name.toLowerCase()].icon
  ) {
    return (
      <img
        src={config.erc20[name.toLowerCase()].icon}
        alt={`${name} icon`}
        role="image"
      />
    )
  }

  if (isIconExist) {
    return (
      <img
        className={className}
        src={icons[name]}
        alt={`${name} icon`}
        role="image"
      />
    )
  }

  return (
    <span
      role="letter"
      styleName="text"
      className={className}
      style={style}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  )
}


export default cssModules(CurrencyIcon, styles)
