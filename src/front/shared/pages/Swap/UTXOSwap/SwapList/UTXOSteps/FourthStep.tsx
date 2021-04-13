import React from 'react'

import CSSModules from 'react-css-modules'
import styles from '../SwapList.scss'
import { isMobile } from 'react-device-detect'

import { FormattedMessage } from 'react-intl'


const FourthStep = (props) => {
  const {
    step,
    swap,
    seventh,
    eighth,
    fields: {
      currencyName,
    },
  } = props

  const currencyStep = swap.sellCurrency === currencyName ? seventh : eighth
  const fourthStepPadding = (step >= currencyStep && isMobile) ? 150 : 0

  return (
    <div
      style={{ paddingTop: fourthStepPadding }}
      styleName={step >= currencyStep ? 'stepItem active checked' : 'stepItem'}>
      <span styleName="stepNumber">{step >= currencyStep ? <i className="fas fa-check" /> : 4}</span>
      <p styleName="stepText">
        <FormattedMessage
          id="BtcToEthToken123"
          defaultMessage="The swap is finish!" />
      </p>
    </div>
  )
}

export default CSSModules(FourthStep, styles, { allowMultiple: true })
