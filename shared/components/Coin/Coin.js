import React from 'react'
import PropTypes from 'prop-types'

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
}

const Coin = ({ className, size, name }) => {
  const style = {
    width: size ? `${size}px` : null,
  }

  let iconProps = {
    name: name.toLowerCase(),
  }

  const isIconExist = iconNames.includes(name.toLowerCase())
  let isIconConfigExist = false

  if (config
    && config.erc20
    && config.erc20[name.toLowerCase()]
    && config.erc20[name.toLowerCase()].icon
  ) {
    isIconConfigExist = true
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

  if (isIconExist || isIconConfigExist) {
    iconProps = {
      ...iconProps,
      styleName: 'icon',
    }
  }
  else {
    iconProps = {
      ...iconProps,
      styleName: 'letter',
      style: {
        lineHeight: `${size}px`,
        fontSize: `${size / 2}px`,
      },
    }
  }

  return (
    <div styleName={`coin ${isDark ? 'dark' : ''}`} className={className} style={style}>
      <CurrencyIcon {...iconProps} />
    </div>
  )
}

Coin.defaultProps = {
  size: 40,
}

Coin.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number,
  name: PropTypes.string.isRequired,
}

export default CSSModules(Coin, styles, { allowMultiple: true })
