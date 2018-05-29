import React from 'react'

import cssModules from 'react-css-modules'
import styles from './InlineLoader.scss'


const InlineLoader = () => (
  <div styleName="ellipsis">
    <div />
    <div />
    <div />
    <div />
  </div>
)

export default cssModules(InlineLoader, styles)
