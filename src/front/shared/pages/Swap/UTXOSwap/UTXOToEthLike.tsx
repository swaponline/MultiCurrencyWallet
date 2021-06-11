import React, { Component } from 'react'

import crypto from 'crypto'

import CSSModules from 'react-css-modules'
import styles from '../Swap.scss'

import { isMobile } from 'react-device-detect'

import SwapProgress from './SwapProgress/SwapProgress'
import FeeControler from '../FeeControler/FeeControler'
import SwapList from './SwapList/SwapList'
import SwapController from '../SwapController'
import SwapPairInfo from './SwapPairInfo'


@CSSModules(styles)
export default class UTXOToEthLike extends Component<any, any> {
  swap = null
  _fields = null
  ParticipantTimer = null
  ethLikeCoin = null

  constructor(props) {
    super(props)
    const { swap, currencyData, fields } = props

    this.swap = swap

    this._fields = fields
    this.ethLikeCoin = fields.ethLikeCoin

    this.state = {
      currencyData,
      enabledButton: false,
      //@ts-ignore: strictNullChecks
      flow: this.swap.flow.state,
      currencyAddress: currencyData.address,
      secret: crypto.randomBytes(32).toString('hex'),
    }
  }

  componentWillMount() {
    //@ts-ignore: strictNullChecks
    this.swap.on('state update', this.handleFlowStateUpdate)
  }

  componentDidMount() {
    const { flow: { isSignFetching, isMeSigned, step, isParticipantSigned, isStoppedSwap } } = this.state
    if (isStoppedSwap) return
    window.addEventListener('resize', this.updateWindowDimensions)
    this.updateWindowDimensions()
    //@ts-ignore: strictNullChecks
    this.ParticipantTimer = setInterval(() => {
      if (this.state.flow.isParticipantSigned && this.state.destinationBuyAddress) {
        //this.submitSecret()
      }
      else {
        //@ts-ignore: strictNullChecks
        clearInterval(this.ParticipantTimer)
      }
    }, 3000)
  }

  componentWillUnmount() {
    const { swap, flow: { isMeSigned } } = this.state
    window.removeEventListener('resize', this.updateWindowDimensions)
    //@ts-ignore: strictNullChecks
    this.swap.off('state update', this.handleFlowStateUpdate)
    //@ts-ignore: strictNullChecks
    clearInterval(this.ParticipantTimer)
  }

  updateWindowDimensions = () => {
    this.setState({ windowWidth: window.innerWidth })
  }

  submitSecret = () => {
    const { secret } = this.state
    //@ts-ignore: strictNullChecks
    this.swap.flow.submitSecret(secret)
  }

  handleFlowStateUpdate = (values) => {
    this.setState({
      flow: values,
    })
  }

  updateBalance = () => {
    //@ts-ignore: strictNullChecks
    this.swap.flow.syncBalance()
  }

  tryRefund = () => {
    //@ts-ignore: strictNullChecks
    this.swap.flow.tryRefund()
    this.setState(() => ({ enabledButton: false }))
  }

  getRefundTxHex = () => {
    const { flow } = this.state

    //@ts-ignore: strictNullChecks
    const { scriptValues } = this._fields

    if (flow.refundTxHex) {
      return flow.refundTxHex
    }
    else if (flow[scriptValues]) {
      //@ts-ignore: strictNullChecks
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

    const { flow, isShowingGhostScript, currencyData, windowWidth } = this.state

    return (
      <div>
        <div
          styleName="swapContainer"
          style={(isMobile && (windowWidth < 569))
            ? { paddingTop: 120 }
            : { paddingTop: 0 }
          }>
          <div>
            {swap.id && <SwapPairInfo swap={swap} />}
            <SwapController swap={swap} />
            <SwapList
              enoughBalance={enoughBalance}
              currencyData={currencyData}
              tokenItems={tokenItems}
              flow={flow}
              onClickCancelSwap={onClickCancelSwap}
              windowWidth={windowWidth}
              name={swap.sellCurrency}
              swap={swap}
              fields={this._fields}
              swapName="BtcLikeToEth"
            />
            <div>
              {!continueSwap
                ? <FeeControler ethAddress={ethAddress} />
                : (
                  <SwapProgress
                    flow={flow}
                    swap={swap}
                    history={history}
                    locale={locale}
                    wallets={wallets}
                    tokenItems={tokenItems}
                    fields={this._fields}
                  />
                )
              }
            </div>
          </div>
          {children && <div styleName="swapContainerInfo">{children}</div>}
        </div>
      </div>
    )
  }
}
