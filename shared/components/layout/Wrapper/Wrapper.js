import React from 'react'

import cssModules from 'react-css-modules'
import styles from './Wrapper.scss'


const Wrapper = ({ children }) => (
  <div styleName="Wrapper">
    {children}
  </div>
)

export default cssModules(Wrapper, styles, { allowMultiple: true })
