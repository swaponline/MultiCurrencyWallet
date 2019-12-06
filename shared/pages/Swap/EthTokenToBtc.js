import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'
import { constants } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './Swap.scss'

import config from 'app-config'
import { isMobile } from 'react-device-detect'
import { BigNumber } from 'bignumber.js'
import { FormattedMessage } from 'react-intl'
import Link from 'sw-valuelink'

import SwapProgress from './SwapProgress/SwapProgress'
import SwapList from './SwapList/SwapList'
import FeeControler from './FeeControler/FeeControler'
import FailControler from './FailControler/FailControler'
import DepositWindow from './DepositWindow/DepositWindow'
import paddingForSwapList from 'shared/helpers/paddingForSwapList.js'


@CSSModules(styles)
export default class EthTokenToBtc extends Component {

  constructor({ swap, currencyData, ethBalance, tokenItems }) {
    super()

    this.swap = swap

    this.state = {
      swap,
      currencyData,
      tokenItems,
      signed: false,
      paddingContainerValue: 0,
      enabledButton: false,
      isAddressCopied: false,
      flow: this.swap.flow.state,
      currencyAddress: currencyData.address,
    }

    this.signTimer = null
    this.confirmBtcTimer = null

  }

  componentWillMount() {
    this.swap.on('state update', this.handleFlowStateUpdate)
  }

  componentWillUnmount() {
    this.swap.off('state update', this.handleFlowStateUpdate)
  }

  componentDidMount() {
    const { flow: { isSignFetching, isMeSigned, step } } = this.state

    this.changePaddingValue()

    this.signTimer = setInterval(() => {
      if (!this.state.flow.isMeSigned) {
        this.signSwap()
      } else {
        clearInterval(this.signTimer)
      }
    }, 3000)

    this.confirmBtcTimer = setInterval(() => {
      if (this.state.flow.step === 3) {
        this.confirmBTCScriptChecked()
      } else {
        clearInterval(this.confirmBtcTimer)
      }
    }, 3000)

    this.requestMaxAllowance()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.flow !== this.state.flow) {
      this.changePaddingValue()
    }
  }

  confirmBTCScriptChecked = () => {
    this.swap.flow.verifyBtcScript()
  }

  changePaddingValue = () => {
    const { flow: { step } } = this.state
    this.setState(() => ({
      paddingContainerValue: paddingForSwapList({ step }),
    }))
  }

  handleFlowStateUpdate = (values) => {

    const stepNumbers = {
      'sign': 1,
      'wait-lock-btc': 2,
      'verify-script': 3,
      'sync-balance': 4,
      'lock-eth': 5,
      'wait-withdraw-eth': 6, // aka getSecret
      'withdraw-btc': 7,
      'finish': 8,
      'end': 9,
    }

    // actions.analytics.swapEvent(stepNumbers[values.step], 'ETHTOKEN2BTC')

    this.setState({
      flow: values,
    })
  }

  signSwap = () => {
    this.swap.flow.sign()
    this.setState(() => ({
      signed: true,
    }))
  }

  toggleBitcoinScript = () => {
    this.setState({
      isShowingBitcoinScript: !this.state.isShowingBitcoinScript,
    })
  }

  requestMaxAllowance = () => {
    const { sellCurrency, sellAmount } = this.swap
    const { ethTokenSwap } = this.swap.flow

    actions.token.setAllowanceForToken({
      name: sellCurrency,
      to: ethTokenSwap.address, // swap contract address
      targetAllowance: sellAmount,
      speed: 'fast',
    })
  }

  handleCopy = () => {
    this.setState({
      isAddressCopied: true,
    }, () => {
      setTimeout(() => {
        this.setState({
          isAddressCopied: false,
        })
      }, 500)
    })
  }

  render() {
    const {
      children,
      disabledTimer,
      continueSwap,
      enoughBalance,
      history,
      ethAddress,
      requestToFaucetSended,
      onClickCancelSwap,
      locale,
      wallets,
    }  = this.props

    const {
      currencyAddress,
      flow,
      enabledButton,
      isShowingBitcoinScript,
      isAddressCopied,
      currencyData,
      tokenItems,
      signed,
      paddingContainerValue,
      swap,
    } = this.state

    const { canCreateEthTransaction, isFailedTransaction, isFailedTransactionError, gasAmountNeeded } = flow

    return (
      <div>
        <div styleName="swapContainer">
          <div>
            <div styleName="swapInfo">
              {this.swap.id &&
                (
                  <strong>
                    {this.swap.sellAmount.toFixed(6)}
                    {' '}
                    {this.swap.sellCurrency} &#10230; {' '}
                    {this.swap.buyAmount.toFixed(6)}
                    {' '}
                    {this.swap.buyCurrency}
                  </strong>
                )
              }
            </div>
            {!enoughBalance && flow.step === 4
              ? (
                <div styleName="swapDepositWindow">
                  <DepositWindow currencyData={currencyData} swap={swap} flow={flow} tokenItems={tokenItems} />
                </div>
              )
              : (
                <Fragment>
                  {!continueSwap
                    ? (
                      <Fragment>
                        {
                          !canCreateEthTransaction && (
                            <FeeControler ethAddress={ethAddress} gasAmountNeeded={gasAmountNeeded} />
                          )
                        }
                        {
                          isFailedTransaction && (
                            <FailControler ethAddress={ethAddress} message={isFailedTransactionError} />
                          )
                        }
                      </Fragment>
                    )
                    : (
                      <SwapProgress
                        flow={flow}
                        name="EthTokensToBtc"
                        swap={swap}
                        tokenItems={tokenItems}
                        history={history}
                        locale={locale}
                        wallets={wallets}
                        signed={signed}
                      />
                    )
                  }
                </Fragment>
              )
            }
          </div>
          <SwapList enoughBalance={enoughBalance} flow={flow} swap={swap} onClickCancelSwap={onClickCancelSwap} />
        </div>
        <div styleName="swapContainerInfo">{children}</div>
      </div>
    )
  }
}
