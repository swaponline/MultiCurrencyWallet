import React, { Component, Fragment } from 'react'



import CSSModules from 'react-css-modules'
import styles from '../Swap.scss'

import config from 'app-config'
import { isMobile } from 'react-device-detect'

import FeeControler from '../FeeControler/FeeControler'
import SwapProgress from './SwapProgress/SwapProgress'
import SwapList from './SwapList/SwapList'
import DepositWindow from './DepositWindow/DepositWindow'


@CSSModules(styles)
export default class EthToUTXO extends Component<any, any> {
  _fields = null
  swap = null
  signTimer = null
  confirmTimer = null

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

    const { currencyAddress, flow, swap, currencyData, signed, buyCurrency, sellCurrency, windowWidth } = this.state
    const stepse = flow.step

    return (
      <div>
        <div styleName="swapContainer" style={(isMobile && (windowWidth < 569)) ? { paddingTop: 120 } : { paddingTop: 0 }}>
          <div>
            <div styleName="swapInfo">
              {/* @ts-ignore: strictNullChecks */}
              {this.swap.id &&
                (
                  <strong>
                    {/* @ts-ignore: strictNullChecks */}
                    {this.swap.sellAmount.toFixed(6)}
                    {' '}
                    {/* @ts-ignore: strictNullChecks */}
                    {this.swap.sellCurrency} &#10230; {' '}
                    {/* @ts-ignore: strictNullChecks */}
                    {this.swap.buyAmount.toFixed(6)}
                    {' '}
                    {/* @ts-ignore: strictNullChecks */}
                    {this.swap.buyCurrency}
                  </strong>
                )
              }
            </div>
            {!enoughBalance && flow.step === 4
              ? (
                <div styleName="swapDepositWindow">
                  <DepositWindow currencyData={currencyData} swap={swap} flow={flow} tokenItems={tokenItems} fields={this._fields} />
                </div>
              )
              : (
                <Fragment>
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
                </Fragment>
              )
            }
          </div>
          <SwapList
            enoughBalance={enoughBalance}
            flow={flow}
            name={swap.sellCurrency}
            windowWidth={windowWidth}
            onClickCancelSwap={onClickCancelSwap}
            swap={swap}
            fields={this._fields}
            swapName="EthToBtcLike"
          />
          <div styleName="swapContainerInfo">{children}</div>
        </div>
      </div>
    )
  }
}
