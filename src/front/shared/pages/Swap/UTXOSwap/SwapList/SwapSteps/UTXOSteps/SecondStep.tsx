import React, { useState, useEffect } from 'react'

import CSSModules from 'react-css-modules'
import styles from '../../SwapList.scss'

import actions from 'redux/actions'
import { isMobile } from 'react-device-detect'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import { FormattedMessage } from 'react-intl'
import { regularIcons } from 'images'

let _mounted = false
const timeoutIds: NodeJS.Timeout[] = []

const SecondStep = (props) => {
  const {
    showDepositWindow,
    isFirstStepActive,
    isSecondStepActive,
    swap: {
      sellCurrency,
      buyCurrency,
      flow: {
        state: {
          ethSwapCreationTransactionHash,
          utxoScriptCreatingTransactionHash,
        },
      },
    },
    fields: {
      explorerLink,
      etherscanLink,
      currencyName,
      ethLikeCoin,
    },
    text,
  } = props

  const [scriptHashIsConfirmed, setScriptHashIsConfirmed] = useState(false)
  const [ethSwapHashIsConfirmed, setEthSwapHashIsConfirmed] = useState(false)
  const [ethSwapHash, setEthSwapHash] = useState('')
  const [scriptHash, setScriptHash] = useState('')

  if (ethSwapCreationTransactionHash && !ethSwapHash) {
    setEthSwapHash(ethSwapCreationTransactionHash)
  }

  if (utxoScriptCreatingTransactionHash && !scriptHash) {
    setScriptHash(utxoScriptCreatingTransactionHash)
  }

  const checkTransactionHash = (txHash, currencyName, refreshTime) => {
    const timeoutId = setTimeout(async () => {
      if (!_mounted) return

      try {
        let fetchedTx: any

        if (currencyName === ethLikeCoin.toLowerCase()) { // TODO: needs to be improved when adding BNB
          fetchedTx = await actions[ethLikeCoin.toLowerCase()].fetchTxInfo(txHash)

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
    timeoutIds.push(timeoutId)
  }

  useEffect(() => {
    _mounted = true
    if (scriptHash && !scriptHashIsConfirmed){
      checkTransactionHash(scriptHash, currencyName, 20)
    }
  }, [scriptHash])

  useEffect(() => {
    _mounted = true
    if (ethSwapHash && !ethSwapHashIsConfirmed){
      checkTransactionHash(ethSwapHash, ethLikeCoin.toLowerCase(), 20)
    }
  }, [ethSwapHash])

  useEffect(() => {
    _mounted = true
    return () => {
      _mounted = false
      timeoutIds.map((id) => clearInterval(id))
    }
  }, [])

  const showStepNumber = isFirstStepActive || isSecondStepActive
  const isStepActive = isMobile ? showStepNumber : isSecondStepActive

  return (
    <div
      styleName={(isStepActive && 'stepItem active') || (isFirstStepActive && 'stepItem') || 'stepItem active checked'}>
      <span styleName="stepNumber">{!isMobile ? (showStepNumber ? 2 : <i className="fas fa-check" />) : (showStepNumber ? 1 : <i className="fas fa-check" />) }</span>
      <p styleName="stepText">
        <FormattedMessage id="BtcToEthToken24" defaultMessage="Deposit" />
      </p>
      {utxoScriptCreatingTransactionHash && (
        <strong styleName="transactionInStep">
          <a
            id="utxoDepositHashLink"
            title={`${explorerLink}/tx/${utxoScriptCreatingTransactionHash}`}
            href={`${explorerLink}/tx/${utxoScriptCreatingTransactionHash}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <FormattedMessage id="FourthStep37BtcLike" defaultMessage="({currencyName} tx)" values={{ currencyName : currencyName.toLowerCase() }} />
            {scriptHashIsConfirmed ? (
              <img
                id="checkedUtxoDepositHashIcon"
                styleName="checkedIcon"
                src={regularIcons.CHECKED}
                alt='checked'
              />
            ) : <InlineLoader />}
            <i className="fas fa-link" />
          </a>
        </strong>
      )}
      {ethSwapCreationTransactionHash && (
        <strong styleName="transactionInStep">
          <a
            id="evmDepositHashLink"
            href={`${etherscanLink}/tx/${ethSwapCreationTransactionHash}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <FormattedMessage
              id="FourthStep52"
              defaultMessage="({otherCurrency} tx)"
              values={{ otherCurrency: sellCurrency.toLowerCase() === currencyName.toLowerCase() ? buyCurrency.toLowerCase() : sellCurrency.toLowerCase() }}
            />
            <i className="fas fa-link" />
            {ethSwapHashIsConfirmed ? (
              <img
                id="checkedEvmDepositHashIcon"
                styleName="checkedIcon"
                src={regularIcons.CHECKED}
                alt='checked'
              />
            ) : <InlineLoader />}
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
      {showDepositWindow ? '' : isStepActive && (
        <span styleName="stepHeading">
          {text}
        </span>
      )}
    </div>
  )
}
export default CSSModules(SecondStep, styles, { allowMultiple: true })
