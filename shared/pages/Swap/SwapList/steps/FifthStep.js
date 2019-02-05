import React from 'react'

import CSSModules from 'react-css-modules'
import styles from '../SwapList.scss'
import { isMobile } from 'react-device-detect'

import { FormattedMessage } from 'react-intl'


const FifthStep = ({ step, swap, seventh, eighth }) => {
  const currencyStep = swap.sellCurrency === 'BTC' ? seventh : eighth
  return (
    <div
      style={isMobile ? { paddingTop: '200px' } : {}}
      styleName={step >= currencyStep ? 'stepItem active checked' : 'stepItem'}>
      <span styleName="stepNumber">{step >= currencyStep ? <i className="fas fa-check" /> : 5}</span>
      <p styleName="stepText">
        <FormattedMessage
          id="BtcToEthToken123"
          defaultMessage="The swap is finish!" />
      </p>
    </div>
  )
}

export default CSSModules(FifthStep, styles, { allowMultiple: true })
