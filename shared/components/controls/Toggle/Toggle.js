import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Toggle.scss'


const Toggle = ({checked, onChange}) => (
    <label styleName="Switch">
      <input type="checkbox" onClick={({target}) => onChange(target.checked)} checked={checked}></input>
      <span></span>
    </label>
  )

export default CSSModules(Toggle, styles)
