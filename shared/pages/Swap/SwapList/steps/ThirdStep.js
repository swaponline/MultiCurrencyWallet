import React from 'react'

import CSSModules from 'react-css-modules'
import styles from '../SwapList.scss'

import config from 'app-config'
import { isMobile } from 'react-device-detect'

import { FormattedMessage } from 'react-intl'


const ThirdStep = ({ step, swap, sixth, seventh, eighth }) => {

  const currencyStep = swap.sellCurrency === 'BTC' ? seventh : eighth
  const stepItemActive = (step >= sixth && step < currencyStep)
  const stepItemDefault = (step < currencyStep)

  return (
    <div
      style={(isMobile && (stepItemActive || !stepItemDefault)) ? { paddingTop: '100px' } : {}}
      styleName={((stepItemActive) && 'stepItem active') || (stepItemDefault && 'stepItem') || 'stepItem active checked'}>
      <span styleName="stepNumber">{step < currencyStep ? 3 : <i className="fas fa-check" />}</span>
      <p styleName="stepText">
        <FormattedMessage id="thirdStep24" defaultMessage="WITHDRAW" />
      </p>
      {swap.flow.state.ethSwapWithdrawTransactionHash && (
        <strong styleName="transactionInStep">
          <a
            href={`${config.link.etherscan}/tx/${swap.flow.state.ethSwapWithdrawTransactionHash}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <FormattedMessage
              id="FourthStep34"
              defaultMessage="({sell} tx)"
              values={{ sell: swap.sellCurrency.toLowerCase() }}
            />
            <i className="fas fa-link" />
          </a>
        </strong>
      )}
      {swap.flow.state.btcSwapWithdrawTransactionHash && (
        <strong styleName="transactionInStep">
          <a
            href={`${config.link.bitpay}/tx/${swap.flow.state.btcSwapWithdrawTransactionHash}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <FormattedMessage
              id="FourthStep36"
              defaultMessage="({btcTx} tx)"
              values={{ btcTx: 'btc' }}
            />
            <i className="fas fa-link" />
          </a>
        </strong>
      )}
    </div>
  )
}

export default CSSModules(ThirdStep, styles, { allowMultiple: true })
