import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './WithdrawButton.scss'


const WithdrawButton = ({ onClick, children }) => (
  <button styleName="withdrawButton" onClick={onClick}>
    {children}
  </button>
)

export default CSSModules(WithdrawButton, styles)
