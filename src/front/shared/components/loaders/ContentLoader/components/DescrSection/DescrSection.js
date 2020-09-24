import React, { Fragment, useState } from 'react'
import CSSModules from 'react-css-modules'

import styles from '../../ContentLoader.scss'


const DescrSection = () => (
  <div styleName="container descr">
    <div styleName="one" />
  </div>
)

export default CSSModules(DescrSection, styles, { allowMultiple: true })
