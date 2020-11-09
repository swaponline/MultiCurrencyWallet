import React, { Fragment, useState } from 'react'
import CSSModules from 'react-css-modules'

import styles from '../../ContentLoader.scss'


function BannersSection() {

  return (
    <div styleName="container banners">
      <div styleName="one" />
      <div styleName="two" />
      <div styleName="three" />
      <div styleName="four" />
    </div>
  )
}

export default CSSModules(BannersSection, styles, { allowMultiple: true })

