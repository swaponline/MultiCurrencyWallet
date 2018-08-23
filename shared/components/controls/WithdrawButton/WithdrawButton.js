import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './WithdrawButton.scss'


const WithdrawButton = ({ onClick, children, className }) => (
  <button styleName="withdrawButton" className={className} onClick={onClick}>
    {children}
  </button>
)

export default CSSModules(WithdrawButton, styles)
