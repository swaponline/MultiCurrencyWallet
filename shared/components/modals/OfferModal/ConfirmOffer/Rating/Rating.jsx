import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Rating.scss'

function Rating() {
  return (
    <div styleName="confirm__row">
      <div styleName="confirm__title">Exchange rate</div>
      <div styleName="confirm__rate">
        <span className="confirm__rate-left">1 <span styleName="confirm__cur">eth</span></span>
        <span styleName="confirm__equal">=</span>
        <span className="confirm__rate-right">0.40922283 <span styleName="confirm__cur">eth</span></span>
      </div>
    </div>
  )
}

export default CSSModules(Rating, styles)

