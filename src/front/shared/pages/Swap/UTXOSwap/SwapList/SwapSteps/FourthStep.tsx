import React from 'react'

import CSSModules from 'react-css-modules'
import styles from '../SwapList.scss'
import { isMobile } from 'react-device-detect'

import { FormattedMessage } from 'react-intl'


const FourthStep = (props) => {
  const {
    stepName,
    text,
  } = props

  const FOURTH_STEP = ['finish', 'end']

  const isSwapFinished = FOURTH_STEP.includes(stepName)

  const fourthStepPadding = (isSwapFinished && isMobile) ? 150 : 0

  return (
    <div
      style={{ paddingTop: fourthStepPadding }}
      styleName={isSwapFinished ? 'stepItem active checked' : 'stepItem'}>
      <span styleName="stepNumber">{isSwapFinished ? <i className="fas fa-check" /> : 4}</span>
      <p id="swapCompleted" styleName="stepText">
        <FormattedMessage
          id="BtcToEthToken123"
          defaultMessage="The swap is finish!" />
      </p>
      {isSwapFinished && (
        <span styleName="stepHeading">
          {text}
        </span>
      )}
    </div>
  )
}

export default CSSModules(FourthStep, styles, { allowMultiple: true })
