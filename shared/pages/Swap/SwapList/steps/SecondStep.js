import React from 'react'

import CSSModules from 'react-css-modules'
import styles from '../SwapList.scss'

import config from 'app-config'
import { isMobile } from 'react-device-detect'

import { FormattedMessage } from 'react-intl'


const SecondStep = ({ step, swap, fifth, fourth, second }) => {

  const currencyStep = swap.sellCurrency === 'BTC' ? fifth : fourth

  return (
    <div
      style={isMobile ? { paddingTop: '50px' } : {}}
      styleName={((step >= second && step < currencyStep) && 'stepItem active') || (step < currencyStep && 'stepItem') || 'stepItem active checked'}>
      <span styleName="stepNumber">{((step >= second && step < currencyStep) && 2) || (step < second && 2) || <i className="fas fa-check" />}</span>
      <p styleName="stepText">
        <FormattedMessage
          id="BtcToEthToken58"
          defaultMessage="Bitcoin is depositing to the contract" />
      </p>
      {swap.flow.state.btcScriptCreatingTransactionHash && (
        <strong styleName="transactionInStep">
          <a
            alt={`${config.link.etherscan}/tx/${swap.flow.state.btcScriptCreatingTransactionHash}`}
            title={`${config.link.etherscan}/tx/${swap.flow.state.btcScriptCreatingTransactionHash}`}
            href={`${config.link.etherscan}/tx/${swap.flow.state.btcScriptCreatingTransactionHash}`}
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

export default CSSModules(SecondStep, styles, { allowMultiple: true })
