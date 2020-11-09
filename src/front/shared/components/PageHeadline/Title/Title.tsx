import React from 'react'

import cssModules from 'react-css-modules'
import styles from './Title.scss'


const Title = ({ children }) => (
  <div styleName="title">{children}</div>
)

export default cssModules(Title, styles)
