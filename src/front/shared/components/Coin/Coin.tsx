import React from 'react'
import { constants } from 'helpers'
import CSSModules from 'react-css-modules'
import styles from './Coin.scss'

import CurrencyIcon, { iconNames } from 'components/ui/CurrencyIcon/CurrencyIcon'
import config from 'app-config'

const isDark = localStorage.getItem(constants.localStorage.isDark)

const defaultCurrencyColors = {
  'btc': 'orange',
  'btc (multisig)': 'orange',
  'btc (sms-protected)': 'orange',
  'btc (pin-protected)': 'orange',
  'usdt': '#33a681',
  'ghost': 'black',
  'next': 'white',
}

type CoinProps = {
  className?: string
  size?: number
  name: string
}

const Coin = (props: CoinProps) => {
  const {
    size = 40,
    className, 
    name,
  } = props

  const isIconExist = iconNames.includes(name.toLowerCase())
  let isIconConfigExist = false

  if (config
    && config.erc20
    && config.erc20[name.toLowerCase()]
    && config.erc20[name.toLowerCase()].icon
  ) {
    isIconConfigExist = true
  }

  // Coin styles *************************

  const style = {
    width: size ? `${size}px` : null,
    height: size ? `${size}px` : null,
    backgroundColor: null,
  }

  if (defaultCurrencyColors[name.toLowerCase()]) {
    style.backgroundColor = defaultCurrencyColors[name.toLowerCase()]
  }
  if (config &&
    config.erc20 &&
    config.erc20[name.toLowerCase()] &&
    config.erc20[name.toLowerCase()].iconBgColor
  ) {
    style.backgroundColor = config.erc20[name.toLowerCase()].iconBgColor
  }

  // *************************************

  let currencyIconProps = {
    name: name.toLowerCase(),
    styleName: '',
    style: {},
  }

  if (isIconExist || isIconConfigExist) {
    currencyIconProps.styleName = 'icon'
  } else {
    currencyIconProps.styleName = 'letter'
    currencyIconProps.style = {
      lineHeight: `${size}px`,
      fontSize: `${size / 2}px`,
    }
  }

  return (
    //@ts-ignore: strictNullChecks
    <div styleName={`coin ${isDark ? 'dark' : ''}`} className={className} style={style}>
      <CurrencyIcon {...currencyIconProps} />
    </div>
  )
}

export default CSSModules(Coin, styles, { allowMultiple: true })
