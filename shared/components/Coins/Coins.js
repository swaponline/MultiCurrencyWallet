import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Coins.scss'

import Coin from 'components/Coin/Coin'


const Coins = ({ className, names, size = 40 }) => (
  <div styleName="coins" className={className}>
    <Coin name={names[0]} size={size} />
    <Coin name={names[1]} size={size} />
  </div>
)

export default CSSModules(Coins, styles)

