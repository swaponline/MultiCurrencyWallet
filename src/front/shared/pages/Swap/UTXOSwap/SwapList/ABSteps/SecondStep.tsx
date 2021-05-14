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


const SecondStep = (props) => {
  let _mounted = false

  const {
    step,
    fifth,
    fourth,
    second,
    sixth,
    windowWidth,
    swap: {
      sellCurrency,
      buyCurrency,
      flow: {
        state: flowState,
        state: {
          ethSwapCreationTransactionHash,
        },
      },
    },
    fields: {
      explorerLink,
      currencyName,
      scriptCreatingTransactionHash,
    },
    text,
  } = props

  const [scriptHashIsConfirmed, setScriptHashIsConfirmed] = useState(false)
  const [ethSwapHashIsConfirmed, setEthSwapHashIsConfirmed] = useState(false)

  const checkTransactionHash = (txHash, currencyName, refreshTime) => {
    setTimeout(async () => {
      if (!_mounted) return

      try {
        let fetchedTx: any

        if (currencyName === 'eth') { // TODO: needs to be improved when adding BNB
          fetchedTx = await actions.eth.fetchTxInfo(txHash, (refreshTime - 5) * 1000)

          if (fetchedTx && fetchedTx.confirmed) {
            return setEthSwapHashIsConfirmed(true)
          } else {
            return checkTransactionHash(txHash, currencyName, refreshTime)
          }
        }

        fetchedTx = await actions[currencyName.toLowerCase()].fetchTx(txHash, (refreshTime - 5) * 1000)

        if (fetchedTx && fetchedTx.confirmations >= 1) {
          return setScriptHashIsConfirmed(true)
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
    if (flowState[scriptCreatingTransactionHash] && !scriptHashIsConfirmed){
      checkTransactionHash(flowState[scriptCreatingTransactionHash], currencyName, 20)
    }
  }, [flowState[scriptCreatingTransactionHash]])

  useEffect(() => {
    if (ethSwapCreationTransactionHash && !ethSwapHashIsConfirmed){
      checkTransactionHash(ethSwapCreationTransactionHash, 'eth', 20)
    }
  }, [ethSwapCreationTransactionHash])

  useEffect(() => {
    _mounted = true
    return () => {
      _mounted = false
    }
  }, [])

  const currencyStep = sellCurrency === currencyName ? fifth : fourth
  const stepItemActive = (step >= second && step < sixth)
  const stepItemDefault = (step < sixth)
  return (
    <div
      styleName={((stepItemActive) && 'stepItem active') || (stepItemDefault && 'stepItem') || 'stepItem active checked'}>
      <span styleName="stepNumber">{!isMobile ? (stepItemDefault ? 2 : <i className="fas fa-check" />) : (stepItemDefault ? 1 : <i className="fas fa-check" />) }</span>
      <p styleName="stepText">
        <FormattedMessage id="BtcToEthToken24" defaultMessage="Deposit" />
      </p>
      {ethSwapCreationTransactionHash && (
        <strong styleName="transactionInStep">
          <a
            href={`${config.link.etherscan}/tx/${ethSwapCreationTransactionHash}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <FormattedMessage
              id="FourthStep52"
              defaultMessage="({otherCurrency} tx)"
              values={{ otherCurrency: sellCurrency === currencyName ? buyCurrency.toLowerCase() : sellCurrency.toLowerCase() }}
            />
            <i className="fas fa-link" />
            {ethSwapHashIsConfirmed ? <img styleName="checkedIcon" src={checkedIcon} alt='checked' /> : <InlineLoader />}
          </a>
        </strong>
      )}
      {flowState[scriptCreatingTransactionHash] && (
        <strong styleName="transactionInStep">
          <a
            title={`${explorerLink}/tx/${flowState[scriptCreatingTransactionHash]}`}
            href={`${explorerLink}/tx/${flowState[scriptCreatingTransactionHash]}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <FormattedMessage id="FourthStep37BtcLike" defaultMessage="({currencyName} tx)" values={{ currencyName : currencyName.toLowerCase() }} />
            <i className="fas fa-link" />
            {scriptHashIsConfirmed ? <img styleName="checkedIcon" src={checkedIcon} alt='checked' /> : <InlineLoader />}
          </a>
        </strong>
      )}
      <div styleName="tooltip">
        <Tooltip id="SecondStep">
          <FormattedMessage
            id="SecondStep"
            defaultMessage="On this step, the crypto goes not to your wallet {br}or to the wallet of your counterparty but directly to the swap contract"
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
export default CSSModules(SecondStep, styles, { allowMultiple: true })
