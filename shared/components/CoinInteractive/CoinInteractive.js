import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './CoinInteractive.scss'

import Coin from 'components/Coin/Coin'
import hideIcon from './images/hide.svg'
import actions from 'redux/actions'


const CoinInteractive = ({ className, name, size = 40 }) => {

  const handleHideCoin = (nameCoin) => {
    actions.core.markCoinAsHidden(nameCoin)
  }

  return (
    <div styleName="coinHover" className={className} onClick={() => handleHideCoin(name)}>
      <Coin name={name} size={size} />
      <div styleName="coinHide">
        <img src={hideIcon} alt={`${name} coin`} />
      </div>
    </div>
  )
}

export default CSSModules(CoinInteractive, styles)
