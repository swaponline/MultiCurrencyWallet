import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Coin.scss'

import CurrencyIcon from 'components/ui/CurrencyIcon/CurrencyIcon'


const Coin = ({ className, size = 40, name }) => {
  const style = {
    width: size ? `${size}px` : null,
  }

  return (
    <div styleName="coin" className={className} style={style}>
      <CurrencyIcon name={name.toLowerCase()} />
    </div>
  )
}

export default CSSModules(Coin, styles)

