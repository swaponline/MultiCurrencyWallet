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

const ThirdStep = (props) => {
  const {
    isFirstStepActive,
    isSecondStepActive,
    isThirdStepActive,
    swap: {
      sellCurrency,
      buyCurrency,
      flow: {
        state: {
          ethSwapWithdrawTransactionHash,
          utxoSwapWithdrawTransactionHash,
        },
      },
    },
    fields: {
      currencyName,
      explorerLink,
      ethLikeCoin,
      etherscanLink,
    },
    text,
  } = props

  const [withdrawHashIsConfirmed, setWithdrawHashIsConfirmed] = useState(false)
  const [ethSwapWithdrawHashIsConfirmed, setEthSwapWithdrawHashIsConfirmed] = useState(false)
  const [ethSwapWithdrawHash, setEthSwapWithdrawHash] = useState('')
  const [withdrawHash, setWithdrawHash] = useState('')

  if (ethSwapWithdrawTransactionHash && !ethSwapWithdrawHash) {
    setEthSwapWithdrawHash(ethSwapWithdrawTransactionHash)
  }

  if (utxoSwapWithdrawTransactionHash && !withdrawHash) {
    setWithdrawHash(utxoSwapWithdrawTransactionHash)
  }

  const checkTransactionHash = (txHash, currencyName, refreshTime) => {
    const timeoutId = setTimeout(async () => {
      if (!_mounted) return

      try {
        let fetchedTx: any

        if (currencyName === ethLikeCoin.toLowerCase()) { // TODO: needs to be improved when adding BNB
          fetchedTx = await actions[ethLikeCoin.toLowerCase()].fetchTxInfo(txHash)

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
    timeoutIds.push(timeoutId)
  }

  useEffect(() => {
    _mounted = true
    if (withdrawHash && !withdrawHashIsConfirmed){
      checkTransactionHash(withdrawHash, currencyName, 20)
    }
  }, [withdrawHash])

  useEffect(() => {
    _mounted = true
    if (ethSwapWithdrawHash && !ethSwapWithdrawHashIsConfirmed){
      checkTransactionHash(ethSwapWithdrawHash, ethLikeCoin.toLowerCase(), 20)
    }
  }, [ethSwapWithdrawHash])

  useEffect(() => {
    _mounted = true
    return () => {
      _mounted = false
      timeoutIds.map((id) => clearInterval(id))
    }
  }, [])

  const isLowStep = isFirstStepActive || isSecondStepActive
  const showStepNumber = isThirdStepActive || isLowStep
  const isStepActive = isMobile ? showStepNumber : isThirdStepActive

  return (
    <div
      styleName={(isStepActive && 'stepItem active') || (isLowStep && 'stepItem') || 'stepItem active checked'}>
      <span styleName="stepNumber">{!isMobile ? (showStepNumber ? 3 : <i className="fas fa-check" />) : (showStepNumber ? 2 : <i className="fas fa-check" />)}</span>
      <p styleName="stepText">
        <FormattedMessage id="thirdStep24" defaultMessage="WITHDRAW" />
      </p>
      {ethSwapWithdrawTransactionHash && (
        <strong styleName="transactionInStep">
          <a
            id="evmWithdrawalHashLink"
            href={`${etherscanLink}/tx/${ethSwapWithdrawTransactionHash}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <FormattedMessage
              id="FourthStep34"
              defaultMessage="({sell} tx)"
              values={{ sell: sellCurrency.toLowerCase() === currencyName.toLowerCase() ? buyCurrency.toLowerCase() : sellCurrency.toLowerCase()  }}
            />
            <i className="fas fa-link" />
            {ethSwapWithdrawHashIsConfirmed ? (
              <img
                id="checkedEvmWithdrawalHashIcon"
                styleName="checkedIcon"
                src={regularIcons.CHECKED}
                alt='checked'
              />
            ) : <InlineLoader />}
          </a>
        </strong>
      )}
      {utxoSwapWithdrawTransactionHash && (
        <strong styleName="transactionInStep">
          <a
            id="utxoWithdrawalHashLink"
            href={`${explorerLink}/tx/${utxoSwapWithdrawTransactionHash}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <FormattedMessage id="FourthStep37_BtcLike" defaultMessage="({currencyName} tx)" values={{ currencyName: currencyName.toLowerCase() }} />
            <i className="fas fa-link" />
            {withdrawHashIsConfirmed ? (
              <img
                id="checkedUtxoWithdrawalHashIcon"
                styleName="checkedIcon"
                src={regularIcons.CHECKED}
                alt='checked'
              />
            ) : <InlineLoader />}
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
      {isStepActive && (
        <span styleName="stepHeading">
          {text}
        </span>
      )}
    </div>
  )
}

export default CSSModules(ThirdStep, styles, { allowMultiple: true })
