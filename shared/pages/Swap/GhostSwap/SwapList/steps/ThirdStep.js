import React from 'react'

import CSSModules from 'react-css-modules'
import styles from '../SwapList.scss'

import config from 'app-config'
import { isMobile } from 'react-device-detect'
import Tooltip from 'components/ui/Tooltip/Tooltip'

import { FormattedMessage } from 'react-intl'


const ThirdStep = ({ step, sixth, seventh, eighth, windowWidth, swap: { sellCurrency, buyCurrency,
  flow: { state: { ethSwapWithdrawTransactionHash, ghostSwapWithdrawTransactionHash } } } }) => {

  const currencyStep = sellCurrency === 'GHOST' ? seventh : eighth
  const stepItemActive = (step >= sixth && step < currencyStep)
  const stepItemDefault = (step < currencyStep)
  const thirdStepPadding = (stepItemActive && isMobile && windowWidth < 569) || (!stepItemDefault && !stepItemActive && isMobile && windowWidth < 569) ? 50 : 0

  return (
    <div
      styleName={((stepItemActive) && 'stepItem active') || (stepItemDefault && 'stepItem') || 'stepItem active checked'}>
      <span styleName="stepNumber">{!isMobile ? (step < currencyStep ? 3 : <i className="fas fa-check" />) : (step < currencyStep ? 2 : <i className="fas fa-check" />)}</span>
      <p styleName="stepText">
        <FormattedMessage id="thirdStep24" defaultMessage="WITHDRAW" />
      </p>
      {ethSwapWithdrawTransactionHash && (
        <strong styleName="transactionInStep">
          <a
            href={`${config.link.etherscan}/tx/${ethSwapWithdrawTransactionHash}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <FormattedMessage
              id="FourthStep34"
              defaultMessage="({sell} tx)"
              values={{ sell: sellCurrency === 'GHOST' ? buyCurrency.toLowerCase() : sellCurrency.toLowerCase()  }}
            />
            <i className="fas fa-link" />
          </a>
        </strong>
      )}
      {ghostSwapWithdrawTransactionHash && (
        <strong styleName="transactionInStep">
          <a
            href={`${config.link.ghostscan}/tx/${ghostSwapWithdrawTransactionHash}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <FormattedMessage id="FourthStep37" defaultMessage="({ghostTx} tx)" values={{ ghostTx: 'ghost' }} />
            <i className="fas fa-link" />
          </a>
        </strong>
      )}
      <div styleName="tooltip">
        <Tooltip id="thirdStep">
          <FormattedMessage
            id="thirdStep"
            defaultMessage="Оn this step crypto is transferred from {br}the contract to your wallet and to the wallet {br} of your counterparty {br}"
            values={{ br: <br /> }}
          />
        </Tooltip >
      </div>
    </div>
  )
}

export default CSSModules(ThirdStep, styles, { allowMultiple: true })
