import React from 'react'

import CSSModules from 'react-css-modules'
import styles from '../SwapList.scss'

import config from 'app-config'
import { isMobile } from 'react-device-detect'

import { FormattedMessage } from 'react-intl'


const ThirdStep = ({ step, swap, fifth, fourth, sixth }) => {

  const currencyStep = swap.sellCurrency === 'BTC' ? fifth : fourth
  const stepItemActive = (step >= currencyStep && step < sixth)
  const stepItemDefault = (step < sixth)

  return (
    <div
      style={(isMobile && (stepItemActive || !stepItemDefault)) ? { paddingTop: '100px' } : {}}
      styleName={((stepItemActive) && 'stepItem active') || (stepItemDefault && 'stepItem') || 'stepItem active checked'}>
      <span styleName="stepNumber">{stepItemDefault ? 3 : <i className="fas fa-check" />}</span>
      <p styleName="stepText">
        <FormattedMessage
          id="BtcToEthToken80"
          defaultMessage="{name} is depositing to the contract"
          values={{ name: swap.sellCurrency === 'BTC' ? swap.buyCurrency : swap.sellCurrency }}
        />
      </p>
      {swap.flow.state.ethSwapCreationTransactionHash && (
        <strong styleName="transactionInStep">
          <a
            href={`${config.link.etherscan}/tx/${swap.flow.state.ethSwapCreationTransactionHash}`}
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

export default CSSModules(ThirdStep, styles, { allowMultiple: true })
