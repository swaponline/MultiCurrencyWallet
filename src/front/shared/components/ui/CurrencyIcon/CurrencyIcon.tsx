import React from 'react'
import cssModules from 'react-css-modules'
import styles from './CurrencyIcon.scss'

import icons from './images'
import { FormattedMessage } from 'react-intl'
import config from 'app-config'


export const currencyIcons = Object.keys(icons)

type CurrencyIconProps = {
  style?: { [key: string]: string }
  className?: string
  name: string
  source?: string
}

const CurrencyIcon = (props: CurrencyIconProps) => {
  const { className, style, name, source } = props

  if (typeof name === 'undefined') {
    return <p><FormattedMessage id="currencyIcon15" defaultMessage="Error" /></p>
  }

  if (source) {
    return <img src={source} alt="icon" role="image" />
  }

  if (config?.erc20[name.toLowerCase()]?.icon) {
    return (
      <img
        src={config.erc20[name.toLowerCase()].icon}
        alt={`${name} icon`}
        role="image"
      />
    )
  }

  const isIconExist = currencyIcons.includes(name.toLowerCase())

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
