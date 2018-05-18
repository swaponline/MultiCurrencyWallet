import React from 'react'
import FlipSvg from './flip.svg'

import CSSModules from 'react-css-modules'
import styles from './Flip.scss'

function Flip() {
  return <a href="#" styleName="trade-panel__change"><img src={FlipSvg} alt="" /></a>
}

export default CSSModules(Flip, styles)
