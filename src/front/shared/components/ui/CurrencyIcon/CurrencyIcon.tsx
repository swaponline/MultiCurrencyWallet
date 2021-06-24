import React from 'react'
import cssModules from 'react-css-modules'
import styles from './CurrencyIcon.scss'

import icons from './images'
import getCoinInfo from 'common/coins/getCoinInfo'
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
  const { className, style, name: coinName , source } = props
  const {
    coin: name,
    blockchain,
  } = getCoinInfo(coinName)

  if (typeof name === 'undefined') {
    return <p><FormattedMessage id="currencyIcon15" defaultMessage="Error" /></p>
  }

  if (source) {
    return (
      <img
        styleName="sizeLimit"
        src={source}
        style={style}
        alt="icon"
        role="image"
      />
    )
  }

  if (config?.erc20[name.toLowerCase()]?.icon) {
    return (
      <img
        styleName="sizeLimit"
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
        styleName="sizeLimit"
        className={className}
        src={icons[name.toLowerCase()]}
        alt={`${name} icon`}
        role="image"
      />
    )
  }

  return (
    <span
      className={className}
      style={style}
      styleName="text"
      role="letter"
    >
      {name.charAt(0).toUpperCase()}
    </span>
  )
}


export default cssModules(CurrencyIcon, styles)
