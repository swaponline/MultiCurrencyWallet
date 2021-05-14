import React, { useState, useEffect } from 'react'

import CSSModules from 'react-css-modules'
import styles from '../SwapList.scss'

import config from 'app-config'
import actions from 'redux/actions'
import { isMobile } from 'react-device-detect'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import { FormattedMessage } from 'react-intl'
import checkedIcon from '../../../images/checked.svg'


const ThirdStep = (props) => {
  let _mounted = false

  const {
    step,
    sixth,
    seventh,
    eighth,
    windowWidth,
    swap: {
      sellCurrency,
      buyCurrency,
      flow: {
        state: flowState,
        state: {
          ethSwapWithdrawTransactionHash,
        },
      },
    },
    fields: {
      withdrawTransactionHash,
      currencyName,
      explorerLink,
    },
    text,
  } = props

  const [withdrawHashIsConfirmed, setWithdrawHashIsConfirmed] = useState(false)
  const [ethSwapWithdrawHashIsConfirmed, setEthSwapWithdrawHashIsConfirmed] = useState(false)

  const checkTransactionHash = (txHash, currencyName, refreshTime) => {
    setTimeout(async () => {
      if (!_mounted) return

      try {
        let fetchedTx: any

        if (currencyName === 'eth') { // TODO: needs to be improved when adding BNB
          fetchedTx = await actions.eth.fetchTxInfo(txHash, (refreshTime - 5) * 1000)

          if (fetchedTx && fetchedTx.confirmed) {
            return setEthSwapWithdrawHashIsConfirmed(true)
          } else {
            return checkTransactionHash(txHash, currencyName, refreshTime)
          }
        }

        fetchedTx = await actions[currencyName.toLowerCase()].fetchTx(txHash, (refreshTime - 5) * 1000)

        if (fetchedTx && fetchedTx.confirmations >= 1) {
          return setWithdrawHashIsConfirmed(true)
        } else {
          return checkTransactionHash(txHash, currencyName, refreshTime)
        }
      } catch (e) {
        console.error(e)
        return checkTransactionHash(txHash, currencyName, refreshTime)
      }
    }, refreshTime * 1000)
  }

  useEffect(() => {
    if (flowState[withdrawTransactionHash] && !withdrawHashIsConfirmed){
      checkTransactionHash(flowState[withdrawTransactionHash], currencyName, 20)
    }
  }, [flowState[withdrawTransactionHash]])

  useEffect(() => {
    if (ethSwapWithdrawTransactionHash && !ethSwapWithdrawHashIsConfirmed){
      checkTransactionHash(ethSwapWithdrawTransactionHash, 'eth', 20)
    }
  }, [ethSwapWithdrawTransactionHash])

  useEffect(() => {
    _mounted = true
    return () => {
      _mounted = false
    }
  }, [])

  const currencyStep = sellCurrency === currencyName ? seventh : eighth
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
      {flowState[withdrawTransactionHash] && (
        <strong styleName="transactionInStep">
          <a
            href={`${explorerLink}/tx/${flowState[withdrawTransactionHash]}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <FormattedMessage id="FourthStep37_BtcLike" defaultMessage="({currencyName} tx)" values={{ currencyName: currencyName.toLowerCase() }} />
            <i className="fas fa-link" />
            {withdrawHashIsConfirmed ? <img styleName="checkedIcon" src={checkedIcon} alt='checked' /> : <InlineLoader />}
          </a>
        </strong>
      )}
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
              values={{ sell: sellCurrency === currencyName ? buyCurrency.toLowerCase() : sellCurrency.toLowerCase()  }}
            />
            <i className="fas fa-link" />
            {ethSwapWithdrawHashIsConfirmed ? <img styleName="checkedIcon" src={checkedIcon} alt='checked' /> : <InlineLoader />}
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
      {stepItemActive && (
        <span styleName="stepHeading">
          {text}
        </span>
      )}
    </div>
  )
}

export default CSSModules(ThirdStep, styles, { allowMultiple: true })
