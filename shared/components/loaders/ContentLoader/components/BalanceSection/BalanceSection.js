import React, { Fragment, useState } from 'react'
import CSSModules from 'react-css-modules'

import styles from '../../ContentLoader.scss'


function BalanceSection() {

  return (
    <div styleName="container balance">
      <div styleName="one" />
      <div styleName="two" />
      <div styleName="three" />
    </div>
  )
}

export default CSSModules(BalanceSection, styles, { allowMultiple: true })

