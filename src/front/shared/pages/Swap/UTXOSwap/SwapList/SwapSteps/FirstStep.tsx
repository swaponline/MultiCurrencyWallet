import React from 'react'

import CSSModules from 'react-css-modules'
import styles from '../SwapList.scss'

import { FormattedMessage } from 'react-intl'


const FirstStep = ({ isFirstStepActive, text }) => (
  <div styleName={ isFirstStepActive ? 'stepItem active' : 'stepItem active checked'}>
    <span styleName="stepNumber">{isFirstStepActive ? 1 : <i id="firtsStepDoneIcon" className="fas fa-check" />}</span>
    <p styleName="stepText">
      <FormattedMessage
        id="Confirmation14"
        defaultMessage="Confirmation"
      />
    </p>
    {isFirstStepActive && (
      <span styleName="stepHeading">
        {text}
      </span>
    )}
  </div>
)

export default CSSModules(FirstStep, styles, { allowMultiple: true })
