import React from 'react'

import CSSModules from 'react-css-modules'
import styles from '../SwapList.scss'
import { isMobile } from 'react-device-detect'

import { FormattedMessage } from 'react-intl'


const FourthStep = (props) => {
  const {
    isFourthStepActive,
    text,
  } = props

  const fourthStepPadding = (isFourthStepActive && isMobile) ? 150 : 0

  return (
    <div
      style={{ paddingTop: fourthStepPadding }}
      styleName={isFourthStepActive ? 'stepItem active checked' : 'stepItem'}>
      <span styleName="stepNumber">{isFourthStepActive ? <i className="fas fa-check" /> : 4}</span>
      <p id="swapCompleted" styleName="stepText">
        <FormattedMessage
          id="BtcToEthToken123"
          defaultMessage="The swap is finish!" />
      </p>
      {isFourthStepActive && (
        <span styleName="stepHeading">
          {text}
        </span>
      )}
    </div>
  )
}

export default CSSModules(FourthStep, styles, { allowMultiple: true })
