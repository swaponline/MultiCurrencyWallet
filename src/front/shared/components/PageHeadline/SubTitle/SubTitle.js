import React from 'react'

import cssModules from 'react-css-modules'
import styles from './SubTitle.scss'


const SubTitle = ({ children }) => (
  <h1 styleName="subTitle">{children}</h1>
)

export default cssModules(SubTitle, styles)
