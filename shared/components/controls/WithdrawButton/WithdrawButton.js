import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './WithdrawButton.scss'
import ReactTooltip from 'react-tooltip'


const WithdrawButton = ({ onClick, children, className, datatip, disabled }) => (
  <button styleName="withdrawButton" className={className} onClick={onClick} disabled={disabled}>
    {children}
  </button>
)

WithdrawButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
  disabled: PropTypes.bool
}


export default CSSModules(WithdrawButton, styles)
