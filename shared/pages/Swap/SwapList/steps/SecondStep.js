import React from 'react'

import CSSModules from 'react-css-modules'
import styles from '../SwapList.scss'

import { FormattedMessage } from 'react-intl'


const SecondStep = ({ step, swap, fifth, fourth, second }) => {

  const currencyStep = swap.sellCurrency === 'BTC' ? fifth : fourth

  return (
    <div styleName={((step >= second && step < currencyStep) && 'stepItem active') || (step < currencyStep && 'stepItem') || 'stepItem active checked'}>
      <span styleName="stepNumber">{((step >= second && step < currencyStep) && 2) || (step < second && 2) || <i className="fas fa-check" />}</span>
      <p styleName="stepText">
        <FormattedMessage
          id="BtcToEthToken58"
          defaultMessage="Bitcoin is depositing to the contract" />
      </p>
    </div>
  )
}

export default CSSModules(SecondStep, styles, { allowMultiple: true })
