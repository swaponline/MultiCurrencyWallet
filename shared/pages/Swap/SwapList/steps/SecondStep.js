import React from 'react'

import CSSModules from 'react-css-modules'
import styles from '../SwapList.scss'

import config from 'app-config'
import { isMobile } from 'react-device-detect'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage } from 'react-intl'


const SecondStep = ({ step, swap, fifth, fourth, second, sixth }) => {

  const currencyStep = swap.sellCurrency === 'BTC' ? fifth : fourth
  const stepItemActive = (step >= second && step < sixth)
  const stepItemDefault = (step < sixth)
  const secondStepPadding = (stepItemActive && isMobile) || (!stepItemDefault && !stepItemActive && isMobile) ? 50 : 0

  return (
    <div
      style={{ paddingTop: secondStepPadding }}
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
      <div styleName="tooltip">
        <Tooltip id="SecondStep">
          <FormattedMessage
            id="SecondStep"
            defaultMessage="These transactions were not sent to your wallet {br}address but to the swap contract script"
            values={{
              br: <br />
            }}
          />
        </Tooltip >
      </div>
    </div>
  )
}
export default CSSModules(SecondStep, styles, { allowMultiple: true })
