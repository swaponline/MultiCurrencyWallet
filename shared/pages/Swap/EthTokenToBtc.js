import React, { Component, Fragment } from 'react'

import config from 'app-config'
import { BigNumber } from 'bignumber.js'
import actions from 'redux/actions'
import { constants } from 'helpers'
import { isMobile } from 'react-device-detect'
import FeeControler from './FeeControler/FeeControler'

import SwapProgress from './SwapProgress/SwapProgress'

import SwapList from './SwapList/SwapList'

import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import TimerButton from 'components/controls/TimerButton/TimerButton'
import Button from 'components/controls/Button/Button'
import Timer from './Timer/Timer'
import { FormattedMessage } from 'react-intl'
import CopyToClipboard from 'react-copy-to-clipboard'
import DepositWindow from './DepositWindow/DepositWindow'
import BtcScript from './BtcScript/BtcScript'


export default class EthTokenToBtc extends Component {

  constructor({ swap, currencyData, ethBalance, tokenItems }) {
    super()

    this.swap = swap

    this.state = {
      swap,
      currencyData,
      tokenItems,
      signed: false,
      enabledButton: false,
      isAddressCopied: false,
      flow: this.swap.flow.state,
      currencyAddress: currencyData.address,
    }
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

    setInterval(() => {
      if (!isMeSigned && step === 1) {
        this.signSwap()
      }
      if (step === 3) {
        this.confirmBTCScriptChecked()
      }
    }, 1000)
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

    actions.analytics.swapEvent(stepNumbers[values.step], 'ETHTOKEN2BTC')

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

  confirmBTCScriptChecked = () => {
    this.swap.flow.verifyBtcScript()
  }

  toggleBitcoinScript = () => {
    this.setState({
      isShowingBitcoinScript: !this.state.isShowingBitcoinScript,
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
    const { children, disabledTimer, continueSwap, enoughBalance, history, ethAddress }  = this.props
    const { currencyAddress, flow, enabledButton, isShowingBitcoinScript, isAddressCopied, currencyData, tokenItems, signed, paddingContainerValue, swap } = this.state

console.log(flow.step)
    return (
      <div>
        <div className={this.props.styles.swapContainer} style={{ paddingTop: isMobile ? `${paddingContainerValue}px` : '' }}>
          {!enoughBalance && flow.step === 4
            ? (
              <div className={this.props.styles.swapDepositWindow}>
                <DepositWindow currencyData={currencyData} swap={swap} flow={flow} tokenItems={tokenItems} />
              </div>
            )
            : (
              <Fragment>
                {flow.step >= 5 && !continueSwap
                  ? <FeeControler ethAddress={ethAddress} />
                  : <SwapProgress flow={flow} name="EthTokensToBtc" swap={swap} tokenItems={tokenItems} history={history} signed={signed} />
                }
              </Fragment>
            )
          }
          <SwapList flow={flow} swap={swap} />
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
      </div>
    )
  }
}
