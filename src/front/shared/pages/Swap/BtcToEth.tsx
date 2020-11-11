import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'
import crypto from 'crypto'

import CSSModules from 'react-css-modules'
import styles from './Swap.scss'

import { isMobile } from 'react-device-detect'
import { FormattedMessage } from 'react-intl'
import { BigNumber } from 'bignumber.js'
import Link from 'sw-valuelink'

import SwapProgress from './SwapProgress/SwapProgress'
import DepositWindow from './DepositWindow/DepositWindow'
import FeeControler from './FeeControler/FeeControler'
import SwapList from './SwapList/SwapList'


@CSSModules(styles)
export default class BtcToEth extends Component<any, any> {

  constructor({ swap, currencyData }) {
    //@ts-ignore
    super()

    this.swap = swap

    this.state = {
      currencyData,
      enabledButton: false,
      flow: this.swap.flow.state,
      currencyAddress: currencyData.address,
      secret: crypto.randomBytes(32).toString('hex'),
    }

    this.ParticipantTimer = null

  }

  componentWillMount() {
    this.swap.on('state update', this.handleFlowStateUpdate)
  }

  componentDidMount() {
    const { flow: { isSignFetching, isMeSigned, step, isParticipantSigned } } = this.state
    window.addEventListener('resize', this.updateWindowDimensions)
    this.updateWindowDimensions()
    this.ParticipantTimer = setInterval(() => {
      if (this.state.flow.isParticipantSigned && this.state.destinationBuyAddress) {
        this.submitSecret()
      } else {
        clearInterval(this.ParticipantTimer)
      }
    }, 3000)
  }

  componentWillUnmount() {
    const { swap, flow: { isMeSigned } } = this.state
    window.removeEventListener('resize', this.updateWindowDimensions)
    this.swap.off('state update', this.handleFlowStateUpdate)
    clearInterval(this.timer)
  }

  updateWindowDimensions = () => {
    this.setState({ windowWidth: window.innerWidth })
  }

  submitSecret = () => {
    const { secret } = this.state
    this.swap.flow.submitSecret(secret)
  }

  tryRefund = () => {
    this.swap.flow.tryRefund()
  }

  handleFlowStateUpdate = (values) => {

    const stepNumbers = {
      1: 'sign',
      2: 'submit-secret',
      3: 'sync-balance',
      4: 'lock-btc',
      5: 'wait-lock-eth',
      6: 'withdraw-eth',
      7: 'finish',
      8: 'end',
    }

    // actions.analytics.swapEvent(stepNumbers[values.step], 'BTC2ETH')

    this.setState({
      flow: values,
    })

  }

  submitSecret = () => {
    const { secret } = this.state
    this.swap.flow.submitSecret(secret)
  }

  updateBalance = () => {
    this.swap.flow.syncBalance()
  }

  tryRefund = () => {
    this.swap.flow.tryRefund()
    this.setState(() => ({ enabledButton: false }))
  }

  getRefundTxHex = () => {
    const { flow } = this.state

    if (flow.refundTxHex) {
      return flow.refundTxHex
    }
    else if (flow.btcScriptValues) {
      this.swap.flow.getRefundTxHex()
    }
  }


  render() {
    const {
      continueSwap,
      enoughBalance,
      swap,
      history,
      tokenItems,
      ethAddress,
      children,
      onClickCancelSwap,
      locale,
      wallets,
    }  = this.props

    const { flow, isShowingBitcoinScript, currencyData, windowWidth } = this.state

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
            <div>
              {!enoughBalance && flow.step === 3
                ? (
                  <div styleName="swapDepositWindow">
                    <DepositWindow currencyData={currencyData} swap={swap} flow={flow} tokenItems={tokenItems} />
                  </div>
                )
                : (
                  <Fragment>
                    {!continueSwap
                      ? <FeeControler ethAddress={ethAddress} />
                      : <SwapProgress
                        flow={flow}
                        name="BtcToEth"
                        swap={swap}
                        history={history}
                        locale={locale}
                        wallets={wallets}
                        tokenItems={tokenItems}
                      />
                    }
                  </Fragment>
                )
              }
            </div>
          </div>
          <SwapList
            enoughBalance={enoughBalance}
            flow={flow}
            onClickCancelSwap={onClickCancelSwap}
            windowWidth={windowWidth}
            name={swap.sellCurrency}
            swap={swap}
          />
          <div styleName="swapContainerInfo">{children}</div>
        </div>
      </div>
    )
  }
}
