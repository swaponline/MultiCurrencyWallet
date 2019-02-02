import React from 'react'

import CSSModules from 'react-css-modules'
import styles from '../SwapList.scss'

import { FormattedMessage } from 'react-intl'


const FourthStep = ({ step, swap, sixth, seventh, eighth }) => {

  const currencyStep = swap.sellCurrency === 'BTC' ? seventh : eighth

  return (
    <div styleName={((step >= sixth && step < currencyStep) && 'stepItem active') || (step < currencyStep && 'stepItem') || 'stepItem active checked'}>
      <span styleName="stepNumber">{step < currencyStep ? 4 : <i className="fas fa-check" />}</span>
      <p styleName="stepText">
        <FormattedMessage
          id="BtcToEthToken102"
          defaultMessage="Withdrawing {name} from the contract"
          values={{ name: swap.sellCurrency === 'BTC' ? swap.buyCurrency : swap.sellCurrency }}
        />
      </p>
    </div>
  )
}

export default CSSModules(FourthStep, styles, { allowMultiple: true })
