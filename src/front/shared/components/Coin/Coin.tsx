import React from 'react'
import CSSModules from 'react-css-modules'
import styles from './Coin.scss'
import web3Icons from 'images'
import CurrencyIcon, { currencyIcons } from 'components/ui/CurrencyIcon/CurrencyIcon'
import config from 'app-config'

const defaultCurrencyColors = {
  'btc': 'orange',
  'btc (multisig)': 'orange',
  'btc (sms-protected)': 'orange',
  'btc (pin-protected)': 'orange',
  'matic': '#8247e5',
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

  const isIconExist = currencyIcons.includes(name.toLowerCase())
  const iconSource = web3Icons[name]
  let isIconConfigExist = false

  if (
    config?.erc20[name.toLowerCase()]?.icon ||
    config?.bep20[name.toLowerCase()]?.icon ||
    config?.erc20matic[name.toLowerCase()]?.icon
  ) {
    isIconConfigExist = true
  }

  // Coin styles *************************

  const style: {
    [ k: string]: string
  } = {
    width: `${size}px`,
    height: `${size}px`,
  }

  if (defaultCurrencyColors[name.toLowerCase()]) {
    style.backgroundColor = defaultCurrencyColors[name.toLowerCase()]
  }

  if (config?.erc20[name.toLowerCase()]?.iconBgColor) {
    style.backgroundColor = config.erc20[name.toLowerCase()].iconBgColor
  }

  if (config?.bep20[name.toLowerCase()]?.iconBgColor) {
    style.backgroundColor = config.bep20[name.toLowerCase()].iconBgColor
  }

  if (config?.erc20matic[name.toLowerCase()]?.iconBgColor) {
    style.backgroundColor = config.erc20matic[name.toLowerCase()].iconBgColor
  }

  // *************************************

  if (config?.isWidget && window?.widgetEvmLikeTokens?.length) {
    window.widgetEvmLikeTokens.forEach((token) =>  {
      if (token.name.toLowerCase() === name.toLowerCase()) {
        token.icon && (isIconConfigExist = true)
        token.iconBgColor && (style.backgroundColor = token.iconBgColor)
      }
    })
  }

  let currencyIconProps = {
    name: name.toLowerCase(),
    styleName: '',
    style: {},
    source: iconSource,
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
    <div
      styleName={`coin ${iconSource ? 'noColors' : ''}`}
      className={className}
      style={style}
    >
      <CurrencyIcon {...currencyIconProps} />
    </div>
  )
}

export default CSSModules(Coin, styles, { allowMultiple: true })
