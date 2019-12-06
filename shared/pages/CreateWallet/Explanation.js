import React, { useState } from 'react'

import { connect } from 'redaction'

import CSSModules from 'react-css-modules'

import { isMobile } from 'react-device-detect'

import styles from './CreateWallet.scss'
import { color } from './chooseColor'
import check from './images/check'


const Explanation = ({ subHeaderText, children, step, createWallet: { step: stepNum }, notMain, isShow }) => (
  <div styleName={`inLine ${notMain ? 'notMain' : ''}`}>
    {!isMobile && !isShow &&
      <div styleName={`stepNumber ${color(step, stepNum)}`}>
        {stepNum > step ? check() : step}
      </div>
    }
    <div styleName={`subHeader ${step === '2' ? 'second' : ''}`}>
      <h5>
        {subHeaderText}
      </h5>
      <p styleName="capture">
        {children}
      </p>
    </div>
  </div>
)
export default connect({
  createWallet: 'createWallet',
})(CSSModules(Explanation, styles, { allowMultiple: true }))
