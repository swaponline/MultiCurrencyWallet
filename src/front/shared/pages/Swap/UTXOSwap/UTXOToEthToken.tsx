import React, { Component } from 'react'

import CSSModules from 'react-css-modules'
import styles from '../Swap.scss'

import crypto from 'crypto'
import SwapApp from 'swap.app'

import SwapProgress from './SwapProgress/SwapProgress'
import SwapList from './SwapList/SwapList'
import FeeControler from '../FeeControler/FeeControler'
import SwapController from '../SwapController'
import SwapPairInfo from './SwapPairInfo'


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
      enabledButton: false,
      isAddressCopied: false,
      //@ts-ignore: strictNullChecks
      flow: this.swap.flow.state,
      destinationAddressTimer: true,
      isShowingScript: false,
      currencyAddress: currencyData.address,
      ethAddress: ethData.map(item => item.address),
      secret: crypto.randomBytes(32).toString('hex'),
      //@ts-ignore: strictNullChecks
      destinationBuyAddress: (this.swap.destinationBuyAddress) ? this.swap.destinationBuyAddress : SwapApp.shared().services.auth.accounts.eth.address,
    }

    this._fields = fields
  }

  componentWillMount() {
    //@ts-ignore: strictNullChecks
    this.swap.on('state update', this.handleFlowStateUpdate)
  }

  componentWillUnmount() {
    //@ts-ignore: strictNullChecks
    this.swap.off('state update', this.handleFlowStateUpdate)
  }

  componentDidMount() {
    const { swap, flow: { step, isParticipantSigned, isStoppedSwap } } = this.state
    if (isStoppedSwap) return
    //@ts-ignore: strictNullChecks
    this.ParticipantTimer = setInterval(() => {
      if (this.state.flow.isParticipantSigned && this.state.destinationBuyAddress) {
        this.submitSecret()
      }
      else {
        //@ts-ignore: strictNullChecks
        clearInterval(this.ParticipantTimer)
      }
    }, 3000)
  }

  submitSecret = () => {
    const { secret } = this.state
    // this.swap.flow.submitSecret(secret)
  }


  handleFlowStateUpdate = (values) => {
    this.setState({
      flow: values,
    })
  }

  toggleScript = () => {
    this.setState({
      isShowingScript: !this.state.isShowingScript,
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
            {swap.id && <SwapPairInfo swap={swap} />}
            <SwapController swap={swap} />
            <SwapList
              flow={this.state.swap.flow.state}
              enoughBalance={enoughBalance}
              currencyData={currencyData}
              tokenItems={tokenItems}
              swap={this.props.swap}
              onClickCancelSwap={onClickCancelSwap}
              fields={this._fields}
              swapName="BtcLikeToEthToken"
            />
            {!continueSwap
              ? ((!waitWithdrawOther) ? feeControllerView : swapProgressView)
              : swapProgressView
            }
          </div>
        </div>
        {children && <div styleName="swapContainerInfo">{children}</div>}
      </div>
    )
  }
}