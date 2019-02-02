import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'

import config from 'app-config'

import { BigNumber } from 'bignumber.js'
import { isMobile } from 'react-device-detect'
import { FormattedMessage } from 'react-intl'

import BtcScript from './BtcScript/BtcScript'
import FeeControler from './FeeControler/FeeControler'
import SwapProgress from './SwapProgress/SwapProgress'
import SwapList from './SwapList/SwapList'
import DepositWindow from './DepositWindow/DepositWindow'


export default class EthToBtc extends Component {
  constructor({ swap, currencyData, depositWindow, enoughBalance }) {
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

  }

  componentWillUnmount() {
    this.swap.off('state update', this.handleFlowStateUpdate)
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

    actions.analytics.swapEvent(stepNumbers[values.step], 'ETH-BTC')

    this.setState({
      flow: values,
    })

  }


  changePaddingValue = () => {
    const { flow } = this.state

    if (flow.step <= 2) {
      this.setState(() => ({
        paddingContainerValue: 60 * flow.step,
      }))
    }
    if (flow.step === 3) {
      this.setState(() => ({
        paddingContainerValue: 120,
      }))
    }
    if (flow.step > 3 && flow.step < 7) {
      this.setState(() => ({
        paddingContainerValue: 60 * (flow.step - 2),
      }))
    }
    if (flow.step >= 7) {
      this.setState(() => ({
        paddingContainerValue: 300,
      }))
    }
  }

  signSwap = () => {
    this.swap.flow.sign()
    this.setState(() => ({
      signed: true,
    }))
  }

  confirmBTCScriptChecked = () => {
    this.swap.flow.verifyBtcScript()
  }

  toggleBitcoinScript = () => {
    this.setState({
      isShowingBitcoinScript: !this.state.isShowingBitcoinScript,
    })
  }

  render() {
    const { tokenItems, continueSwap, enoughBalance, history, ethAddress, children  } = this.props
    const { currencyAddress, flow, isShowingBitcoinScript, swap, currencyData, signed, paddingContainerValue, buyCurrency, sellCurrency } = this.state


    return (
      <div>
        <div className={this.props.styles.swapContainer} style={{ paddingTop: isMobile ? `${paddingContainerValue}px` : '' }}>
          <div className={this.props.styles.swapInfo}>
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
          {!this.props.enoughBalance && flow.step === 4
            ? (
              <div className={this.props.styles.swapDepositWindow}>
                <DepositWindow currencyData={currencyData} swap={swap} flow={flow} tokenItems={tokenItems} />
              </div>
            )
            : (
              <Fragment>
                {flow.step >= 5 && !continueSwap
                  ? <FeeControler ethAddress={ethAddress} />
                  : <SwapProgress flow={flow} name="EthToBtc" swap={swap} history={history} signed={signed} tokenItems={tokenItems} />
                }
              </Fragment>
            )
          }
          <SwapList flow={flow} name={swap.sellCurrency} swap={swap} />
        </div>
        { flow.btcScriptValues &&
          <span onClick={this.toggleBitcoinScript}>
            <FormattedMessage id="swapJS341" defaultMessage="Show bitcoin script" />
          </span>
        }
        {isShowingBitcoinScript &&
          <BtcScript
            secretHash={flow.btcScriptValues.secretHash}
            recipientPublicKey={flow.btcScriptValues.recipientPublicKey}
            lockTime={flow.btcScriptValues.lockTime}
            ownerPublicKey={flow.btcScriptValues.ownerPublicKey}
          />}
          {children}
      </div>
    )
  }
}
