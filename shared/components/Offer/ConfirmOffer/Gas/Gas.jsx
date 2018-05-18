import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Gas.scss'

function Gas() {
  return (
    <div styleName="confirm__row">
      <div styleName="confirm__title">Miner fee</div>
      <div styleName="confirm__fee">0.001 <span styleName="confirm__cur"> icx</span></div>
    </div>
  )
}

export default CSSModules(Gas, styles)

