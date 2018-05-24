import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Coins.scss'

import CurrencyIcon from 'components/ui/CurrencyIcon/CurrencyIcon'


const Coins = ({ buyCurrency, sellCurrency }) => (
  <div styleName="coins">
    <div styleName="coin">
      <CurrencyIcon name={sellCurrency.toLowerCase()} />
    </div>
    <div styleName="coin">
      <CurrencyIcon name={buyCurrency.toLowerCase()} />
    </div>
  </div>
)

export default CSSModules(Coins, styles)

