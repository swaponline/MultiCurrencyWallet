import React from 'react'

import CSSModules from 'react-css-modules'
import styles from '../SwapList.scss'

import config from 'app-config'
import { isMobile } from 'react-device-detect'

import { FormattedMessage } from 'react-intl'


const SecondStep = ({ step, swap, fifth, fourth, second, sixth }) => {

  const currencyStep = swap.sellCurrency === 'BTC' ? fifth : fourth
  const stepItemActive = (step >= second && step < sixth)
  const stepItemDefault = (step < sixth)

  return (
    <div
      style={(isMobile && (stepItemActive || !stepItemDefault)) ? { paddingTop: '50px' } : {}}
      styleName={((stepItemActive) && 'stepItem active') || (stepItemDefault && 'stepItem') || 'stepItem active checked'}>
      <span styleName="stepNumber">{stepItemDefault ? 2 : <i className="fas fa-check" />}</span>
      <p styleName="stepText">
        <FormattedMessage id="BtcToEthToken24" defaultMessage="Deposit" />
      </p>
      {swap.flow.state.btcScriptCreatingTransactionHash && (
        <strong styleName="transactionInStep">
          <a
            alt={`${config.link.bitpay}/tx/${swap.flow.state.btcScriptCreatingTransactionHash}`}
            title={`${config.link.bitpay}/tx/${swap.flow.state.btcScriptCreatingTransactionHash}`}
            href={`${config.link.bitpay}/tx/${swap.flow.state.btcScriptCreatingTransactionHash}`}
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
      {swap.flow.state.ethSwapCreationTransactionHash && (
        <strong styleName="transactionInStep">
          <a
            href={`${config.link.etherscan}/tx/${swap.flow.state.ethSwapCreationTransactionHash}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <FormattedMessage
              id="FourthStep52"
              defaultMessage="({otherCurrency} tx)"
              values={{ otherCurrency: swap.sellCurrency === 'BTC' ? swap.buyCurrency.toLowerCase() : swap.sellCurrency.toLowerCase() }}
            />
            <i className="fas fa-link" />
          </a>
        </strong>
      )}
    </div>
  )
}
export default CSSModules(SecondStep, styles, { allowMultiple: true })
