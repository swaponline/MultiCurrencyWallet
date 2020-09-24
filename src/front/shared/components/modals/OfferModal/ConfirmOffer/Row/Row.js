import React from 'react'

import cssModules from 'react-css-modules'
import styles from './Row.scss'


const Row = ({ title, children }) => (
  <div styleName="row">
    <div styleName="title">{title}</div>
    <div styleName="content">
      {children}
    </div>
  </div>
)

export default cssModules(Row, styles)
