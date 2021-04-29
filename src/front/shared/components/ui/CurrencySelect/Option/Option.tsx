import React from 'react'

import cssModules from 'react-css-modules'
import styles from './Option.scss'

import CurrencyIcon from 'components/ui/CurrencyIcon/CurrencyIcon'
import config from 'app-config'


const Option = (props) => {
  let { icon, title } = props
  if (icon.toLowerCase() === `eth` && config.binance) {
    icon = `bnb`
    title = `Binance`
  }
  return (
    <div styleName="optionrow">
      <span styleName="circle">
        <CurrencyIcon styleName="icon" name={icon} />
      </span>
      {title}
    </div>
  )
}


export default cssModules(Option, styles)
