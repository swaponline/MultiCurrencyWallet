import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'

import CSSModules from 'react-css-modules'
import styles from './Swap.scss'

import crypto from 'crypto'
import SwapApp from 'swap.app'
import Link from 'sw-valuelink'

import DepositWindow from './GhostSwap/DepositWindow/DepositWindow'
import SwapProgress from './GhostSwap/SwapProgress/SwapProgress'
import SwapList from './GhostSwap/SwapList/SwapList'
import FeeControler from './FeeControler/FeeControler'
import paddingForSwapList from 'shared/helpers/paddingForSwapList.js'


@CSSModules(styles)
export default class GhostToEthToken extends Component {

  constructor({ swap, currencyData, ethData, enoughBalance, styles, depositWindow }) {

    super()

    this.swap = swap

    this.state = {
      swap,
      depositWindow,
      enoughBalance,
      isPressCtrl: false,
      isTextCopied: false,
      enabledButton: false,
      isAddressCopied: false,
      flow: this.swap.flow.state,
      paddingContainerValue: 0,
      destinationAddressTimer: true,
      isShowingGhostScript: false,
      currencyAddress: currencyData.address,
      ethAddress: ethData.map(item => item.address),
      secret: crypto.randomBytes(32).toString('hex'),
      destinationBuyAddress: (this.swap.destinationBuyAddress) ? this.swap.destinationBuyAddress : SwapApp.shared().services.auth.accounts.eth.address,
    }

    this.ParticipantTimer = null

  }

  componentWillMount() {
    this.swap.on('state update', this.handleFlowStateUpdate)
  }

  componentWillUnmount() {
    this.swap.off('state update', this.handleFlowStateUpdate)
  }

  componentDidMount() {
    const { swap, flow: { step, isParticipantSigned } } = this.state
    this.changePaddingValue()

    this.ParticipantTimer = setInterval(() => {
      if (this.state.flow.isParticipantSigned && this.state.destinationBuyAddress) {
        this.submitSecret()
      }
      else {
        clearInterval(this.ParticipantTimer)
      }
    }, 3000)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.flow !== this.state.flow) {
      this.changePaddingValue()
    }
  }

  submitSecret = () => {
    const { secret } = this.state
    this.swap.flow.submitSecret(secret)
  }

  changePaddingValue = () => {
    const { flow: { step } } = this.state
    this.setState(() => ({
      paddingContainerValue: paddingForSwapList({ step }),
    }))
  }

  changePaddingValue = () => {
    const { flow: { step } } = this.state
    this.setState(() => ({
      paddingContainerValue: paddingForSwapList({ step }),
    }))
  }

  changePaddingValue = () => {
    const { flow } = this.state

    if (flow.step <= 2) {
      this.setState(() => ({
        paddingContainerValue: 60 * flow.step,
      }))
    }
    if (flow.step > 5 && flow.step < 7) {
      this.setState(() => ({
        paddingContainerValue: 180,
      }))
    }
    if (flow.step > 7) {
      this.setState(() => ({
        paddingContainerValue: 210,
      }))
    }
  }

  handleFlowStateUpdate = (values) => {

    const stepNumbers = {
      'sign': 1,
      'submit-secret': 2,
      'sync-balance': 3,
      'lock-ghost': 4,
      'wait-lock-eth': 5,
      'withdraw-eth': 6,
      'finish': 7,
      'end': 8,
    }

    // actions.analytics.swapEvent(stepNumbers[values.step], 'BTC2ETHTOKEN')

    this.setState({
      flow: values,
    })
  }

  toggleBitcoinScript = () => {
    this.setState({
      isShowingGhostScript: !this.state.isShowingGhostScript,
    })
  }

  handleCopyAddress = (e) => {
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

  handleCopyText = () => {
    this.setState({
      isTextCopied: true,
    }, () => {
      setTimeout(() => {
        this.setState({
          isTextCopied: false,
        })
      }, 15 * 1000)
    })
  }

  onCopyAddress = (e) => {
    e.preventDefault()
    this.setState({
      isPressCtrl: true,
    })
  }

  render() {
    const {
      children,
      disabledTimer,
      currencyData,
      continueSwap,
      enoughBalance,
      history,
      tokenItems,
      waitWithdrawOther,
      onClickCancelSwap,
      locale,
      wallets,
    } = this.props

    const {
      swap,
      flow,
      secret,
      ethAddress,
      paddingContainerValue,
      isShowingBitcoinScript,
    } = this.state

    const linked = Link.all(this, 'destinationBuyAddress')

    linked.destinationBuyAddress.check((value) => value !== '', 'Please enter ETH address for tokens')

    const feeControllerView = <FeeControler ethAddress={ethAddress} />
    const swapProgressView = <SwapProgress flow={flow} name="GhostToEthTokens" swap={this.props.swap} history={history} locale={locale} wallets={wallets} tokenItems={tokenItems} />

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
            {!enoughBalance && flow.step === 3
              ? (
                <div styleName="swapDepositWindow">
                  <DepositWindow currencyData={currencyData} swap={swap} flow={flow} tokenItems={tokenItems} />
                </div>
              )
              : (
                <Fragment>
                  {!continueSwap
                    ? ((!waitWithdrawOther) ? feeControllerView : swapProgressView)
                    : swapProgressView
                  }
                </Fragment>
              )
            }
          </div>
          <SwapList flow={this.state.swap.flow.state} enoughBalance={enoughBalance} swap={this.props.swap} onClickCancelSwap={onClickCancelSwap} />
        </div>
        <div styleName="swapContainerInfo">{children}</div>
      </div>
    )
  }
}
