import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Loader.scss'


const Loader = ({ className }) => (
  <div styleName="overlay" className={className}>
    <div styleName="loader center">
      <div styleName="loader1" />
      <div styleName="loader2" />
      <div styleName="loader3" />
    </div>
  </div>
)


export default CSSModules(Loader, styles, { allowMultiple: true })
