import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Flip.scss'

import FlipSvg from './images/flip.svg'


function Flip({ onClick }) {
  return <img src={FlipSvg} alt="" onClick={onClick} styleName="trade-panel__change" />
}

export default CSSModules(Flip, styles)
