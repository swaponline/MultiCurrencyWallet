import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'
import helpers from 'helpers'
import config from 'app-config'

import CSSModules from 'react-css-modules'
import styles from './Swap.scss'

import { isMobile } from 'react-device-detect'
import { FormattedMessage } from 'react-intl'
import { BigNumber } from 'bignumber.js'
import Link from 'sw-valuelink'

import FeeControler from './FeeControler/FeeControler'
import SwapProgress from './SwapProgress/SwapProgress'
import SwapList from './SwapList/SwapList'
import DepositWindow from './DepositWindow/DepositWindow'

@CSSModules(styles)
export default class EthToBtc extends Component<any, any> {
  constructor({ swap, currencyData, depositWindow, enoughBalance }) {
    //@ts-ignore
    super()

    this.swap = swap

    this.state = {
      swap,
      currencyData,
      enoughBalance,
      signed: false,
      depositWindow,
      enabledButton: false,
      isAddressCopied: false,
      flow: this.swap.flow.state,
      isShowingBitcoinScript: false,
      currencyAddress: currencyData.address,
    }

    this.signTimer = null
    this.confirmBtcTimer = null

  }

  componentWillMount() {
    this.swap.on('state update', this.handleFlowStateUpdate)

  }

  componentDidMount() {
    const { swap, flow: { isSignFetching, isMeSigned, step } } = this.state
    window.addEventListener('resize', this.updateWindowDimensions)
    this.updateWindowDimensions()
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
  }

  componentWillUnmount() {
    this.swap.off('state update', this.handleFlowStateUpdate)
    window.removeEventListener('resize', this.updateWindowDimensions)
  }

  updateWindowDimensions = () => {
    this.setState({ windowWidth: window.innerWidth })
  }

  confirmBTCScriptChecked = () => {
    this.swap.flow.verifyBtcScript()
  }

  handleFlowStateUpdate = (values) => {
    const { swap, flow: { isMeSigned } } = this.state
    const stepNumbers = {
      1: 'sign',
      2: 'wait-lock-btc',
      3: 'verify-script',
      4: 'sync-balance',
      5: 'lock-eth',
      6: 'wait-withdraw-eth',
      7: 'withdraw-btc',
      8: 'finish',
      9: 'end',
    }

    // actions.analytics.swapEvent(stepNumbers[values.step], 'ETH-BTC')

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

  render() {
    const {
      tokenItems,
      continueSwap,
      enoughBalance,
      history,
      ethAddress,
      children,
      requestToFaucetSended,
      onClickCancelSwap,
      locale,
      wallets,
    } = this.props

    const { currencyAddress, flow, isShowingBitcoinScript, swap, currencyData, signed, buyCurrency, sellCurrency, windowWidth } = this.state
    const stepse = flow.step

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
                    ? <FeeControler ethAddress={ethAddress} requestToFaucetSended={requestToFaucetSended} />
                    : <SwapProgress flow={flow} name="EthToBtc" swap={swap}  history={history} signed={signed} locale={locale} wallets={wallets} tokenItems={tokenItems} />
                  }
                </Fragment>
              )
            }
          </div>
          <SwapList enoughBalance={enoughBalance} flow={flow} name={swap.sellCurrency} windowWidth={windowWidth} onClickCancelSwap={onClickCancelSwap} swap={swap} />
          <div styleName="swapContainerInfo">{children}</div>
        </div>
      </div>
    )
  }
}
