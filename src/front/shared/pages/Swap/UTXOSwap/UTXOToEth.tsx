import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'
import crypto from 'crypto'

import CSSModules from 'react-css-modules'
import styles from '../Swap.scss'

import { isMobile } from 'react-device-detect'
import { FormattedMessage } from 'react-intl'
import { BigNumber } from 'bignumber.js'

import SwapProgress from './SwapProgress/SwapProgress'
import DepositWindow from './DepositWindow/DepositWindow'
import FeeControler from '../FeeControler/FeeControler'
import SwapList from './SwapList/SwapList'
import paddingForSwapList from 'shared/helpers/paddingForSwapList'


@CSSModules(styles)
export default class UTXOToEth extends Component<any, any> {
  swap = null
  _fields = null
  ParticipantTimer = null

  constructor(props) {
    super(props)
    const { swap, currencyData, fields } = props

    this.swap = swap

    this._fields = fields
    this.state = {
      currencyData,
      enabledButton: false,
      flow: this.swap.flow.state,
      paddingContainerValue: 60,
      currencyAddress: currencyData.address,
      secret: crypto.randomBytes(32).toString('hex'),
    }
  }

  componentWillMount() {
    this.swap.on('state update', this.handleFlowStateUpdate)
  }

  componentDidMount() {
    const { flow: { isSignFetching, isMeSigned, step, isParticipantSigned } } = this.state
    window.addEventListener('resize', this.updateWindowDimensions)
    this.updateWindowDimensions()
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

  componentWillUnmount() {
    const { swap, flow: { isMeSigned } } = this.state
    window.removeEventListener('resize', this.updateWindowDimensions)
    this.swap.off('state update', this.handleFlowStateUpdate)
    clearInterval(this.ParticipantTimer)
  }

  updateWindowDimensions = () => {
    this.setState({ windowWidth: window.innerWidth })
  }

  submitSecret = () => {
    const { secret } = this.state
    this.swap.flow.submitSecret(secret)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.flow !== this.state.flow) {
      this.changePaddingValue()
    }
  }

  changePaddingValue = () => {
    const { flow: { step } } = this.state
    this.setState(() => ({
      paddingContainerValue: paddingForSwapList({ step }),
    }))
  }

  handleFlowStateUpdate = (values) => {
    /** todo - not used - remove **/
    const stepNumbers = {
      1: 'sign',
      2: 'submit-secret',
      3: 'sync-balance',
      4: 'lock-ghost',
      5: 'wait-lock-eth',
      6: 'withdraw-eth',
      7: 'finish',
      8: 'end',
    }

    // actions.analytics.swapEvent(stepNumbers[values.step], 'GHOST2ETH')

    this.setState({
      flow: values,
    })

    this.changePaddingValue()
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

    const { scriptValues } = this._fields

    if (flow.refundTxHex) {
      return flow.refundTxHex
    }
    else if (flow[scriptValues]) {
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

    const { flow, isShowingGhostScript, currencyData, paddingContainerValue, windowWidth } = this.state

    return (
      <div>
        <div
          styleName="swapContainer"
          style={(isMobile && (windowWidth < 569))
            ? { paddingTop: paddingContainerValue }
            : { paddingTop: 0 }
          }>
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
                    <DepositWindow currencyData={currencyData} swap={swap} flow={flow} tokenItems={tokenItems} fields={this._fields} />
                  </div>
                )
                : (
                  <Fragment>
                    {!continueSwap
                      ? <FeeControler ethAddress={ethAddress} />
                      : (
                        <SwapProgress
                          flow={flow}
                          name="BtcLikeToEth"
                          swap={swap}
                          history={history}
                          locale={locale}
                          wallets={wallets}
                          tokenItems={tokenItems}
                          fields={this._fields}
                        />
                      )
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
            fields={this._fields}
          />
          <div styleName="swapContainerInfo">{children}</div>
        </div>
      </div>
    )
  }
}
