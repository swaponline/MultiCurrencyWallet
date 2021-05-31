import React from 'react'

import CSSModules from 'react-css-modules'
import styles from '../SwapList.scss'

import { FormattedMessage } from 'react-intl'


const FirstStep = ({ stepName, text }) => (
  <div styleName={ stepName === 'sign' ? 'stepItem active' : 'stepItem active checked'}>
    <span styleName="stepNumber">{stepName === 'sign' ? 1 : <i id="firtsStepDoneIcon" className="fas fa-check" />}</span>
    <p styleName="stepText">
      <FormattedMessage
        id="Confirmation14"
        defaultMessage="Confirmation"
      />
    </p>
    {stepName === 'sign' && (
      <span styleName="stepHeading">
        {text}
      </span>
    )}
  </div>
)

export default CSSModules(FirstStep, styles, { allowMultiple: true })
