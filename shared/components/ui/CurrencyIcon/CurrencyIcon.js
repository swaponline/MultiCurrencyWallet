import React from 'react'

import cssModules from 'react-css-modules'
import styles from './CurrencyIcon.scss'

import icons from './images'


export const iconNames = Object.keys(icons)


const CurrencyIcon = ({ className, style, name }) => {
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
