import React from 'react'

import CSSModules from 'react-css-modules'
import styles from '../SwapList.scss'

import { FormattedMessage } from 'react-intl'


const FirstStep = ({ step, first, second }) => (
  <div styleName={(step === first && 'stepItem active') || (step < second && 'stepItem') || 'stepItem active checked'}>
    <span styleName="stepNumber">{step < second ? 1 : <i className="fas fa-check" />}</span>
    <p styleName="stepText">
      <FormattedMessage
        id="Confirmation14"
        defaultMessage="Confirmation" />
    </p>
  </div>
)

export default CSSModules(FirstStep, styles, { allowMultiple: true })
