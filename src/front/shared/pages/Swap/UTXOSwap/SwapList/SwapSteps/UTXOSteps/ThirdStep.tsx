import React, { useState, useEffect } from 'react'

import CSSModules from 'react-css-modules'
import styles from '../../SwapList.scss'

import config from 'app-config'
import actions from 'redux/actions'
import { isMobile } from 'react-device-detect'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import { FormattedMessage } from 'react-intl'
import checkedIcon from '../../../../images/checked.svg'

let _mounted = false
const timeoutIds: NodeJS.Timeout[] = []

const ThirdStep = (props) => {
  const {
    stepName,
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
  const [ethSwapWithdrawHash, setEthSwapWithdrawHash] = useState('')
  const [withdrawHash, setWithdrawHash] = useState('')

  if (ethSwapWithdrawTransactionHash && !ethSwapWithdrawHash) {
    setEthSwapWithdrawHash(ethSwapWithdrawTransactionHash)
  }

  if (flowState[withdrawTransactionHash] && !withdrawHash) {
    setWithdrawHash(flowState[withdrawTransactionHash])
  }

  const checkTransactionHash = (txHash, currencyName, refreshTime) => {
    const timeoutId = setTimeout(async () => {
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
      checkTransactionHash(ethSwapWithdrawHash, 'eth', 20)
    }
  }, [ethSwapWithdrawHash])

  useEffect(() => {
    _mounted = true
    return () => {
      _mounted = false
      timeoutIds.map((id) => clearInterval(id))
    }
  }, [])

  const TAKER_UTXO_SECOND_STEPS = ['submit-secret', 'sync-balance', 'lock-utxo', 'wait-lock-eth']
  const MAKER_UTXO_SECOND_STEPS = ['sync-balance', 'wait-lock-eth', 'lock-utxo']

  const TAKER_UTXO_THIRD_STEPS = ['withdraw-eth']
  const MAKER_UTXO_THIRD_STEPS  = ['wait-withdraw-utxo', 'withdraw-eth']

  const activeStep = flowState.isTaker ? TAKER_UTXO_SECOND_STEPS : MAKER_UTXO_SECOND_STEPS
  const thirdActiveStep = flowState.isTaker ? TAKER_UTXO_THIRD_STEPS : MAKER_UTXO_THIRD_STEPS

  const isFirstStepActive = (stepName === 'sign')
  const isSecondStepActive = (activeStep.includes(stepName))
  const isThirdStepActive = (thirdActiveStep.includes(stepName))

  const showStepNumber = isFirstStepActive || isSecondStepActive || isThirdStepActive

  return (
    <div
      styleName={(isFirstStepActive && 'stepItem active') || ((isFirstStepActive || isSecondStepActive) && 'stepItem') || 'stepItem active checked'}>
      <span styleName="stepNumber">{!isMobile ? (showStepNumber ? 3 : <i className="fas fa-check" />) : (showStepNumber ? 2 : <i className="fas fa-check" />)}</span>
      <p styleName="stepText">
        <FormattedMessage id="thirdStep24" defaultMessage="WITHDRAW" />
      </p>
      {ethSwapWithdrawTransactionHash && (
        <strong styleName="transactionInStep">
          <a
            id="evmWithdrawalHashLink"
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
            {ethSwapWithdrawHashIsConfirmed ? <img id="checkedEvmWithdrawalHashIcon" styleName="checkedIcon" src={checkedIcon} alt='checked' /> : <InlineLoader />}
          </a>
        </strong>
      )}
      {flowState[withdrawTransactionHash] && (
        <strong styleName="transactionInStep">
          <a
            id="utxoWithdrawalHashLink"
            href={`${explorerLink}/tx/${flowState[withdrawTransactionHash]}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <FormattedMessage id="FourthStep37_BtcLike" defaultMessage="({currencyName} tx)" values={{ currencyName: currencyName.toLowerCase() }} />
            <i className="fas fa-link" />
            {withdrawHashIsConfirmed ? <img id="checkedUtxoWithdrawalHashIcon" styleName="checkedIcon" src={checkedIcon} alt='checked' /> : <InlineLoader />}
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
      {isFirstStepActive && (
        <span styleName="stepHeading">
          {text}
        </span>
      )}
    </div>
  )
}

export default CSSModules(ThirdStep, styles, { allowMultiple: true })
