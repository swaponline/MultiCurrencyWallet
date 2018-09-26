import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './Coins.scss'

import Coin from 'components/Coin/Coin'


const Coins = ({ className, names, size }) => (
  <div styleName="coins" className={className}>
    <Coin name={names[0]} size={size} />
    <Coin name={names[1]} size={size} />
  </div>
)

Coins.defaultProps = {
  size: 40,
}

Coins.propTypes = {
  names: PropTypes.array.isRequired,
  size: PropTypes.number,
  className: PropTypes.string,
}

export default CSSModules(Coins, styles)

