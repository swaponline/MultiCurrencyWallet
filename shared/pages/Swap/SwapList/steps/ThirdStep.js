import React from 'react'

import CSSModules from 'react-css-modules'
import styles from '../SwapList.scss'

import config from 'app-config'

import { FormattedMessage } from 'react-intl'


const ThirdStep = ({ step, swap, fifth, fourth, sixth }) => {

  const currencyStep = swap.sellCurrency === 'BTC' ? fifth : fourth

  return (
    <div styleName={((step >= currencyStep && step < sixth) && 'stepItem active') || (step < sixth && 'stepItem') || 'stepItem active checked'}>
      <span styleName="stepNumber">{step < sixth ? 3 : <i className="fas fa-check" />}</span>
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
            <i className="fas fa-link" />
          </a>
        </strong>
      )}
    </div>
  )
}

export default CSSModules(ThirdStep, styles, { allowMultiple: true })
