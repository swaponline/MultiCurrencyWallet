import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './ReloadButton.scss'

import ReloadIcon from 'components/ui/ReloadIcon/ReloadIcon'


const ReloadButton = ({ className, onClick }) => (
  <div styleName="reloadButton" className={className} onClick={onClick}>
    <ReloadIcon styleName="icon" />
  </div>
)

export default CSSModules(ReloadButton, styles)
