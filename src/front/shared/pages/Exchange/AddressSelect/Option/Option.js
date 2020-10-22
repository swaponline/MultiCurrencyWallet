import React from 'react'

import cssModules from 'react-css-modules'
import styles from './Option.scss'


const Option = ({ icon, title, smalltext, disabled }) => (
  <div styleName={`optionrow ${disabled ? 'disabled' : ''}`}>
    {icon && (
      <em>
        <img src={icon} />
      </em>
    )}
    <div styleName={`optionTitle ${smalltext ? 'smalltext' : ''}`}>{title}</div>
  </div>
)


export default cssModules(Option, styles, { allowMultiple: true })
