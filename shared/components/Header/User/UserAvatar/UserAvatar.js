import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './UserAvatar.scss'


const UserAvatar = () => (
  <div styleName="user">
    <span styleName="name">K</span>
  </div>
)

export default CSSModules(UserAvatar, styles)
