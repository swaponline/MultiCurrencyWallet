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
import paddingForSwapList from 'shared/helpers/paddingForSwapList.js'


@CSSModules(styles)
export default class BtcToQtum extends Component {

  constructor({ swap, currencyData }) {
    super()

    this.swap = swap

    this.state = {
      currencyData,
      enabledButton: false,
      flow: this.swap.flow.state,
      paddingContainerValue: 60,
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
    clearInterval(this.timer)
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

    const stepNumbers = {
      1: 'sign',
      2: 'submit-secret',
      3: 'sync-balance',
      4: 'lock-btc',
      5: 'wait-lock-qtum',
      6: 'withdraw-qtum',
      7: 'finish',
      8: 'end',
    }


    this.setState({
      flow: values,
    })

    this.changePaddingValue()
  }

  confirmAddress = () => {
    this.swap.setDestinationBuyAddress(this.state.destinationBuyAddress)
    this.setState({ destinationAddressTimer : false })
  }

  submitSecret = () => {
    const { secret } = this.state
    this.swap.flow.submitSecret(secret)
  }

  updateBalance = () => {
    this.swap.flow.syncBalance()
  }


  render() {
    const {
      swap,
      history,
      tokenItems,
      ethAddress,
      children,
      onClickCancelSwap,
      locale,
      wallets,
    }  = this.props

    const { flow, isShowingBitcoinScript, currencyData, paddingContainerValue, windowWidth } = this.state

    return (
      <div>
        <div
          styleName="swapContainer"
          style={(isMobile && (windowWidth < 569))
            ? { paddingTop: paddingContainerValue }
            : { paddingTop: 0 }
          }>
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
          <SwapProgress
            flow={flow}
            name="BtcToQtum"
            swap={swap}
            history={history}
            locale={locale}
            wallets={wallets}
            tokenItems={tokenItems}
          />
          <SwapList
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
