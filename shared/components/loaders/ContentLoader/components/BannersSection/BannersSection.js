import React, { Fragment, useState } from 'react'
import CSSModules from 'react-css-modules'

import styles from '../../ContentLoader.scss'

function BannersSection() {

  return (
    <div styleName="container banners">
        <div styleName="one"></div>
        <div styleName="two"></div>
        <div styleName="three"></div>
        <div styleName="four"></div>
    </div>
  );
}

export default CSSModules(BannersSection, styles, { allowMultiple: true })



