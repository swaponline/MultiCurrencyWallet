import React, { useState } from 'react'

import { connect } from 'redaction'

import CSSModules from 'react-css-modules'

import { isMobile } from 'react-device-detect'

import styles from './CreateWallet.scss'
import { color } from './chooseColor'
import check from './images/check'


const CreateWallet = ({ subHeaderText, children, step, createWallet: { step: stepNum } }) => (
  <div styleName="inLine">
    {!isMobile &&
      <div styleName={`stepNumber ${color(step, stepNum)}`}>
        {step > stepNum ? check() : stepNum}
      </div>
    }
    <div styleName={`subHeader ${step === '3' ? 'third' : ''}`}>
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
})(CSSModules(CreateWallet, styles, { allowMultiple: true }))
