import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'

import crypto from 'crypto'

import CSSModules from 'react-css-modules'
import styles from './Swap.scss'

import { BigNumber } from 'bignumber.js'
import { isMobile } from 'react-device-detect'
import { FormattedMessage } from 'react-intl'

import SwapProgress from './SwapProgress/SwapProgress'
import DepositWindow from './DepositWindow/DepositWindow'
import BtcScript from './BtcScript/BtcScript'
import FeeControler from './FeeControler/FeeControler'
import SwapList from './SwapList/SwapList'


export default class BtcToEth extends Component {

  constructor({ swap, currencyData }) {
    super()

    this.swap = swap

    this.state = {
      currencyData,
      isShowingBitcoinScript: false,
      enabledButton: false,
      flow: this.swap.flow.state,
      currencyAddress: currencyData.address,
      secret: crypto.randomBytes(32).toString('hex'),
    }
  }

  componentWillMount() {
    this.swap.on('state update', this.handleFlowStateUpdate)
  }

  componentWillUnmount() {
    this.swap.off('state update', this.handleFlowStateUpdate)
  }

  componentDidMount() {
    const { flow: { isSignFetching, isMeSigned, step, isParticipantSigned } } = this.state

    this.changePaddingValue()

    setInterval(() => {
      if (step === 1) {
        this.confirmAddress()
      }
      if (step === 2 && isParticipantSigned) {
        this.submitSecret()
      }
    }, 1000)
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

    actions.analytics.swapEvent(stepNumbers[values.step], 'BTC2ETH')

    this.setState({
      flow: values,
    })
  }

  toggleBitcoinScript = () => {
    this.setState({
      isShowingBitcoinScript: !this.state.isShowingBitcoinScript,
    })
  }

  confirmAddress = () => {
    this.swap.setDestinationBuyAddress(this.state.destinationBuyAddress)
    this.setState({ destinationAddressTimer : false })
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

  submitSecret = () => {
    const { secret } = this.state
    this.swap.flow.submitSecret(secret)
  }

  updateBalance = () => {
    this.swap.flow.syncBalance()
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
    const { children, continueSwap, enoughBalance, swap, history, tokenItems, ethAddress }  = this.props

    const { flow, isShowingBitcoinScript, currencyData, paddingContainerValue } = this.state

    return (
      <div>
        <div className={this.props.styles.swapContainer} style={{ paddingTop: isMobile ? `${paddingContainerValue}px` : '' }}>
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
                  : <SwapProgress flow={flow} name="BtcToEth" swap={swap} history={history} tokenItems={tokenItems} />
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
