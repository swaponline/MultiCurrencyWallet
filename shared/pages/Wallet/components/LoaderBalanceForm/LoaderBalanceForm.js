import React, { Fragment, useState } from 'react'
import CSSModules from 'react-css-modules'

import styles from './LoaderBalanceForm.scss'



function LoaderBalanceForm() {

  return (
    <div styleName="animationLoading">
        <div styleName="container">
            <div styleName="one"></div>
            <div styleName="two"></div>
            <div styleName="three"></div>
        </div>
    </div>
  );
}

export default CSSModules(LoaderBalanceForm, styles, { allowMultiple: true })



