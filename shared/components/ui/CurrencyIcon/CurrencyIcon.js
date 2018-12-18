import React from 'react'

import cssModules from 'react-css-modules'
import styles from './CurrencyIcon.scss'

import icons from './images'
import { FormattedMessage } from 'react-intl'


export const iconNames = Object.keys(icons)


const CurrencyIcon = ({ className, style, name, currency }) => {
  if (typeof name === 'undefined') {
    return <p>{<FormattedMessage id="currencyIcon15" defaultMessage="Error" />}</p>
  }
  const isIconExist = iconNames.includes(name.toLowerCase())

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
