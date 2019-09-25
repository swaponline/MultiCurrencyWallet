import React, { useState } from 'react'
import CSSModules from 'react-css-modules'

import styles from './CreateWallet.scss'


const CreateWallet = ({ subHeaderText, children, step }) => (
  <div>
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
export default CSSModules(CreateWallet, styles, { allowMultiple: true })
