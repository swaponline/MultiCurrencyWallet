import React, { Component } from 'react'

import CSSModules from 'react-css-modules'
import styles from '../Swap.scss'

import { isMobile } from 'react-device-detect'

import FeeControler from '../FeeControler/FeeControler'
import SwapProgress from './SwapProgress/SwapProgress'
import SwapList from './SwapList/SwapList'
import SwapController from '../SwapController'
import SwapPairInfo from './SwapPairInfo'


@CSSModules(styles)
export default class EthLikeToUTXO extends Component<any, any> {
  _fields = null
  swap = null
  signTimer = null
  confirmTimer = null
  ethLikeCoin = null

  constructor(props) {
    super(props)
    const {
      swap,
      currencyData,
      depositWindow,
      enoughBalance,
      verifyScriptFunc,
      fields,
    } = props

    this._fields = fields
    this.ethLikeCoin = fields.ethLikeCoin

    this.swap = swap

    this.state = {
      swap,
      currencyData,
      enoughBalance,
      signed: false,
      depositWindow,
      enabledButton: false,
      isAddressCopied: false,
      //@ts-ignore: strictNullChecks
      flow: this.swap.flow.state,
      isShowingGhostScript: false,
      currencyAddress: currencyData.address,
    }
  }

  componentWillMount() {
    //@ts-ignore: strictNullChecks
    this.swap.on('state update', this.handleFlowStateUpdate)

  }

  componentDidMount() {
    const { swap, flow: { isSignFetching, isMeSigned, step, isStoppedSwap } } = this.state
    if (isStoppedSwap) return
    window.addEventListener('resize', this.updateWindowDimensions)
    this.updateWindowDimensions()
    //@ts-ignore: strictNullChecks
    this.signTimer = setInterval(() => {
      if (!this.state.flow.isMeSigned) {
        this.signSwap()
      } else {
        //@ts-ignore: strictNullChecks
        clearInterval(this.signTimer)
      }
    }, 3000)

    /*
    // verify script auto in core flow
    this.confirmTimer = setInterval(() => {
      if (this.state.flow.step === 3) {
        this.confirmScriptChecked()
      } else {
        clearInterval(this.confirmTimer)
      }
    }, 3000)
    */
  }

  componentWillUnmount() {
    //@ts-ignore: strictNullChecks
    this.swap.off('state update', this.handleFlowStateUpdate)
    window.removeEventListener('resize', this.updateWindowDimensions)
  }

  updateWindowDimensions = () => {
    this.setState({ windowWidth: window.innerWidth })
  }

  confirmScriptChecked = () => {
    const {
      //@ts-ignore: strictNullChecks
      verifyScriptFunc,
    } = this._fields

    //@ts-ignore: strictNullChecks
    this.swap.flow[verifyScriptFunc]()
  }

  handleFlowStateUpdate = (values) => {
    const {
      swap,
      flow: {
        isMeSigned,
      },
    } = this.state

    //@ts-ignore: strictNullChecks
    const { currencyName } = this._fields

    this.setState({
      flow: values,
    })

  }

  signSwap = () => {
    //@ts-ignore: strictNullChecks
    this.swap.flow.sign()
    this.setState(() => ({
      signed: true,
    }))
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

    const { flow, swap, currencyData, signed, windowWidth } = this.state

    return (
      <div>
        <div styleName="swapContainer" style={(isMobile && (windowWidth < 569)) ? { paddingTop: 120 } : { paddingTop: 0 }}>
          <div>
            {swap.id && <SwapPairInfo swap={swap} />}
            <SwapController swap={swap} />
            <SwapList
              enoughBalance={enoughBalance}
              currencyData={currencyData}
              tokenItems={tokenItems}
              flow={flow}
              name={swap.sellCurrency}
              windowWidth={windowWidth}
              onClickCancelSwap={onClickCancelSwap}
              swap={swap}
              fields={this._fields}
              swapName="EthToBtcLike"
            />
            {!continueSwap
              ? <FeeControler ethAddress={ethAddress} requestToFaucetSended={requestToFaucetSended} />
              : (
                <SwapProgress
                  flow={flow}
                  swap={swap}
                  history={history}
                  signed={signed}
                  locale={locale}
                  wallets={wallets}
                  tokenItems={tokenItems}
                  fields={this._fields}
                />
              )
            }
          </div>
          {children && <div styleName="swapContainerInfo">{children}</div>}
        </div>
      </div>
    )
  }
}
