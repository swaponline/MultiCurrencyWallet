import React from 'react'

import cssModules from 'react-css-modules'
import styles from './WidthContainerCompensator.scss'


const WidthContainerCompensator = ({ children, ...rest }) => (
  <div styleName="widthContainerCompensator" {...rest}>
    {children}
  </div>
)

export default cssModules(WidthContainerCompensator, styles)
