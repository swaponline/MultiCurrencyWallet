import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Loader.scss'


const Loader = ({ overlayClassName, className, text = false }) => (
  <div styleName="overlay" className={overlayClassName}>
    <div styleName="loader center" className={className}>
      <div styleName="loader1" />
      <div styleName="loader2" />
      <div styleName="loader3" />
    </div>
    {
      text && <p styleName="text">Please wait, it takes from 3 to 5 minutes to complete the transaction.</p>
    }
  </div>
)


export default CSSModules(Loader, styles, { allowMultiple: true })
