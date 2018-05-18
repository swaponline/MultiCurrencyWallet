import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Exchange.scss'

function Exchange() {
  return (
    <div styleName="confirm__row">
      <div styleName="confirm__title">Exchange</div>
      <div styleName="confirm__from-to">
        <span className="confirm__from">12.278079 <span styleName="confirm__cur">eth</span></span>
        <span styleName="confirm__arrow"><img src="img/arrow-right.svg" alt="" /></span>
        <span className="confirm__to">7.75056072 <span styleName="confirm__cur">icx</span></span>
      </div>
    </div>
  )
}

export default CSSModules(Exchange, styles)

