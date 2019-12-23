import React, { Fragment, useState } from 'react'
import CSSModules from 'react-css-modules'

import styles from './LoaderTransaction.scss'



function LoaderTransaction() {

  return (
    <div styleName="animationLoading">
        <div styleName="container">
            <div styleName="one"></div>
            <div styleName="two"></div>
            <div styleName="three"></div>
            <div styleName="four"></div>
            <div styleName="five"></div>
        </div>
    </div>
  );
}

export default CSSModules(LoaderTransaction, styles, { allowMultiple: true })



