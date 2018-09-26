import React from 'react'
import PropTypes from 'prop-types'

import actions from 'redux/actions'

import CSSModules from 'react-css-modules'
import styles from './CoinInteractive.scss'
import hideIcon from './images/hide.svg'

import Coin from 'components/Coin/Coin'


const CoinInteractive = ({ className, name }) => {

  const handleHideCoin = (nameCoin) => {
    actions.core.markCoinAsHidden(nameCoin)
  }

  return (
    <div styleName="coinHover" className={className} onClick={() => handleHideCoin(name)}>
      <Coin name={name} />
      <div styleName="coinHide">
        <img src={hideIcon} alt={`${name} coin`} />
      </div>
    </div>
  )
}

CoinInteractive.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
}

export default CSSModules(CoinInteractive, styles)
