import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Field.scss'


const Field = ({ privateKey, label }) => (
  <div styleName="row" >
    <p><strong>{`${label} ${privateKey}`}</strong></p>
  </div>
)

export default CSSModules(Field, styles)
