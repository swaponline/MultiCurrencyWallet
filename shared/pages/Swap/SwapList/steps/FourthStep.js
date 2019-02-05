import React from 'react'

import CSSModules from 'react-css-modules'
import styles from '../SwapList.scss'

import config from 'app-config'
import { isMobile } from 'react-device-detect'

import { FormattedMessage } from 'react-intl'


const FourthStep = ({ step, swap, sixth, seventh, eighth }) => {

  const currencyStep = swap.sellCurrency === 'BTC' ? seventh : eighth

  return (
    <div
      style={isMobile ? { paddingTop: '150px' } : {}}
      styleName={((step >= sixth && step < currencyStep) && 'stepItem active') || (step < currencyStep && 'stepItem') || 'stepItem active checked'}>
      <span styleName="stepNumber">{step < currencyStep ? 4 : <i className="fas fa-check" />}</span>
      <p styleName="stepText">
        <FormattedMessage
          id="BtcToEthToken102"
          defaultMessage="Withdrawing {name} from the contract"
          values={{ name: swap.sellCurrency === 'BTC' ? swap.buyCurrency : swap.sellCurrency }}
        />
      </p>
      {swap.flow.state.ethSwapWithdrawTransactionHash && (
        <strong styleName="transactionInStep">
          <a
            href={`${config.link.etherscan}/tx/${swap.flow.state.ethSwapWithdrawTransactionHash}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <FormattedMessage
              id="FourthStep33"
              defaultMessage="(tx)"
            />
            <i className="fas fa-link" />
          </a>
        </strong>
      )}
    </div>
  )
}

export default CSSModules(FourthStep, styles, { allowMultiple: true })
