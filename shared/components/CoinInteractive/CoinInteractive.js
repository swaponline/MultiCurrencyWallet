import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './CoinInteractive.scss'

import Coin from 'components/Coin/Coin'
import hideIcon from './images/hide.svg'

const CoinInteractive = ({ className, name, size = 40, onHide }) => (
  <div styleName="coinHover" className={className} onClick={()=>onHide(name)}>
    <Coin name={name} size={size} />
    <div styleName="coinHide">
      <img src={hideIcon}></img>
    </div>
  </div>
)

export default CSSModules(CoinInteractive, styles)
