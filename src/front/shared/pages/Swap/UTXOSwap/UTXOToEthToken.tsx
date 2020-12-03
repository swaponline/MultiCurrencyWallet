import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'

import CSSModules from 'react-css-modules'
import styles from '../Swap.scss'

import crypto from 'crypto'
import SwapApp from 'swap.app'

import DepositWindow from './DepositWindow/DepositWindow'
import SwapProgress from './SwapProgress/SwapProgress'
import SwapList from './SwapList/SwapList'
import FeeControler from '../FeeControler/FeeControler'


@CSSModules(styles)
export default class UTXOToEthToken extends Component<any, any> {
  swap = null
  _fields = null
  confirmAddressTimer = null
  ParticipantTimer = null

  constructor(props) {
    super(props)
    const { swap, currencyData, ethData, enoughBalance, styles, depositWindow, fields } = props

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
      destinationAddressTimer: true,
      isShowingScript: false,
      currencyAddress: currencyData.address,
      ethAddress: ethData.map(item => item.address),
      secret: crypto.randomBytes(32).toString('hex'),
      destinationBuyAddress: (this.swap.destinationBuyAddress) ? this.swap.destinationBuyAddress : SwapApp.shared().services.auth.accounts.eth.address,
    }

    this._fields = fields
  }

  componentWillMount() {
    this.swap.on('state update', this.handleFlowStateUpdate)
  }

  componentWillUnmount() {
    this.swap.off('state update', this.handleFlowStateUpdate)
  }

  componentDidMount() {
    const { swap, flow: { step, isParticipantSigned } } = this.state

    this.ParticipantTimer = setInterval(() => {
      if (this.state.flow.isParticipantSigned && this.state.destinationBuyAddress) {
        this.submitSecret()
      }
      else {
        clearInterval(this.ParticipantTimer)
      }
    }, 3000)
  }

  submitSecret = () => {
    const { secret } = this.state
    this.swap.flow.submitSecret(secret)
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

  toggleScript = () => {
    this.setState({
      isShowingScript: !this.state.isShowingScript,
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
      isShowingScript,
    } = this.state

    const feeControllerView = (
      <FeeControler
        ethAddress={ethAddress}
        fields={this._fields}
      />
    )
    const swapProgressView = (
      <SwapProgress
        flow={flow}
        name="BtcLikeToEthToken"
        swap={this.props.swap}
        history={history}
        locale={locale}
        wallets={wallets}
        tokenItems={tokenItems}
        fields={this._fields}
      />
    )

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
                  <DepositWindow
                    currencyData={currencyData}
                    swap={swap}
                    flow={flow}
                    tokenItems={tokenItems}
                    fields={this._fields}
                  />
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
          <SwapList
            flow={this.state.swap.flow.state}
            enoughBalance={enoughBalance}
            swap={this.props.swap}
            onClickCancelSwap={onClickCancelSwap}
            fields={this._fields}
          />
        </div>
        <div styleName="swapContainerInfo">{children}</div>
      </div>
    )
  }
}
