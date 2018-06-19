import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Loader.scss'


const Loader = ({ overlayClassName, className }) => (
  <div styleName="overlay" className={overlayClassName}>
    <div styleName="loader center" className={className}>
      <div styleName="loader1" />
      <div styleName="loader2" />
      <div styleName="loader3" />
    </div>
  </div>
)


export default CSSModules(Loader, styles, { allowMultiple: true })
