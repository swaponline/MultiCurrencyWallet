import React from 'react'
import cssModules from 'react-css-modules'
import styles from './CurrencyIcon.scss'
import TOKEN_STANDARDS from 'helpers/constants/TOKEN_STANDARDS'
import icons from './images'
import getCoinInfo from 'common/coins/getCoinInfo'
import { FormattedMessage } from 'react-intl'
import config from 'app-config'

export const currencyIcons = Object.keys(icons)

function returnTokenIcon(name) {
  try {
    for (const key in TOKEN_STANDARDS) {
      const standard = TOKEN_STANDARDS[key].standard
      const icon = config[standard][name]?.icon

      if (icon) return icon
    }
  } catch (error) {
    console.group('%c CurrencyIcon', 'color: red')
    console.error('can\'t to load currency icon')
    console.groupEnd()
  }
}

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

  const tokenIcon = returnTokenIcon(name.toLowerCase())

  if (tokenIcon) {
    return (
      <img
        styleName="sizeLimit"
        className={className}
        src={tokenIcon}
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
