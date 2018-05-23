import React from 'react'

import cssModules from 'react-css-modules'
import styles from './Button.scss'


const Button = ({ children, className, onClick }) => (
  <div styleName="button" className={className} onClick={onClick}>
    {children}
  </div>
)

export default cssModules(Button, styles)
