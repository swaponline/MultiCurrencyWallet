import React from 'react'

import cssModules from 'react-css-modules'
import styles from './Option.scss'


const Option = ({ icon, title }) => (
  <div styleName="optionrow">
    {icon && (
      <em>
        <img src={icon} />
      </em>
    )}
    <span>{title}</span>
  </div>
)


export default cssModules(Option, styles)
