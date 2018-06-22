import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Field.scss'


const Field = ({ privateKey, label }) => (
  <div styleName="row" >
    <p>{`${label} ${privateKey}`}</p>
  </div>
)

export default CSSModules(Field, styles)
