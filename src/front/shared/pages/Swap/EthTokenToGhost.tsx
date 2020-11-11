import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'
import { constants } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './Swap.scss'

import SwapProgress from './GhostSwap/SwapProgress/SwapProgress'
import SwapList from './GhostSwap/SwapList/SwapList'
import FeeControler from './FeeControler/FeeControler'
import FailControler from './FailControler/FailControler'
import DepositWindow from './GhostSwap/DepositWindow/DepositWindow'
import paddingForSwapList from 'shared/helpers/paddingForSwapList'


@CSSModules(styles)
export default class EthTokenToGhost extends Component<any, any> {

  constructor({ swap, currencyData, ethBalance, tokenItems }) {
    //@ts-ignore
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
    this.confirmGhostTimer = null

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

    this.confirmGhostTimer = setInterval(() => {
      if (this.state.flow.step === 3) {
        this.confirmGhostScriptChecked()
      } else {
        clearInterval(this.confirmGhostTimer)
      }
    }, 3000)

    this.requestMaxAllowance()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.flow !== this.state.flow) {
      this.changePaddingValue()
    }
  }

  confirmGhostScriptChecked = () => {
    this.swap.flow.verifyGhostScript()
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
      'wait-lock-ghost': 2,
      'verify-script': 3,
      'sync-balance': 4,
      'lock-eth': 5,
      'wait-withdraw-eth': 6, // aka getSecret
      'withdraw-ghost': 7,
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

  toggleGhostScript = () => {
    this.setState({
      isShowingGhostScript: !this.state.isShowingGhostScript,
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
                        name="EthTokensToGhost"
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
