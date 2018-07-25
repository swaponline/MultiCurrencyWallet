import React from 'react'

import cssModules from 'react-css-modules'
import styles from './SubTitle.scss'


const SubTitle = ({ children }) => (
  <div styleName="subTitle">{children}</div>
)

export default cssModules(SubTitle, styles)
