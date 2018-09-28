import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './WithdrawButton.scss'


const WithdrawButton = ({ onClick, children, className }) => (
  <button styleName="withdrawButton" className={className} onClick={onClick}>
    {children}
  </button>
)

WithdrawButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
}

export default CSSModules(WithdrawButton, styles)
