import React, { Fragment, useState } from 'react'
import CSSModules from 'react-css-modules'

import styles from '../../ContentLoader.scss'

function BalanceSection() {

  return (
    <div styleName="container balance">
        <div styleName="one"></div>
        <div styleName="two"></div>
        <div styleName="three"></div>
    </div>
  );
}

export default CSSModules(BalanceSection, styles, { allowMultiple: true })



