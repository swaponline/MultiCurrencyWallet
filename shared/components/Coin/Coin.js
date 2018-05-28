import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Coin.scss'

import CurrencyIcon, { iconNames } from 'components/ui/CurrencyIcon/CurrencyIcon'


const Coin = ({ className, size = 40, name }) => {
  const style = {
    width: size ? `${size}px` : null,
  }

  const isIconExist = iconNames.includes(name.toLowerCase())
  let content

  if (isIconExist) {
    content = (
      <CurrencyIcon styleName="icon" name={name.toLowerCase()} />
    )
  }
  else {
    content = (
      <div
        styleName="text"
        style={{
          lineHeight: `${size}px`,
          fontSize: `${size / 2}px`,
        }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <div styleName="coin" className={className} style={style}>
      {content}
    </div>
  )
}

export default CSSModules(Coin, styles)

