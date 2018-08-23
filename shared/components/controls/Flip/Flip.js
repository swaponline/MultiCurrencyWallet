import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Flip.scss'


function Flip({ onClick }) {
  return <button alt="flip currency" onClick={onClick} styleName="trade-panel__change" />
}

export default CSSModules(Flip, styles)
