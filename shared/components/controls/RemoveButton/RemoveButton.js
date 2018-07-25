import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './RemoveButton.scss'

import RemoveIcon from 'components/ui/RemoveIcon/RemoveIcon'


const RemoveButton = ({ className, onClick }) => (
  <div styleName="removeButton" className={className} onClick={onClick}>
    <RemoveIcon styleName="icon" />
  </div>
)

export default CSSModules(RemoveButton, styles)
