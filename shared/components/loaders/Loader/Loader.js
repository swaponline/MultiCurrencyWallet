import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Loader.scss'


const Loader = ({ overlayClassName, className, overlay = true }) => (
  <div styleName={overlay ?  'overlay' : ''} className={overlayClassName}>
    <div styleName={overlay ? 'loader center' : 'loader'} className={className}>
      <div styleName="loader1" />
      <div styleName="loader2" />
      <div styleName="loader3" />
    </div>
  </div>
)


export default CSSModules(Loader, styles, { allowMultiple: true })
