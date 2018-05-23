import React from 'react'

import cssModules from 'react-css-modules'
import styles from './FieldLabel.scss'


const FieldLabel = ({ children }) => (
  <div styleName="label">{children}</div>
)

export default cssModules(FieldLabel, styles)
