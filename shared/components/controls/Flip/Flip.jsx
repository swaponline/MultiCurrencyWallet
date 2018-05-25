import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Flip.scss'

import FlipSvg from './images/flip.svg'


function Flip() {
  return <a href="#" styleName="trade-panel__change"><img src={FlipSvg} alt="" /></a>
}

export default CSSModules(Flip, styles)
