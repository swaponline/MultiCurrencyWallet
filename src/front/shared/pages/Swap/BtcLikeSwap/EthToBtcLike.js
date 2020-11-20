import React, { Component, Fragment } from 'react'



import CSSModules from 'react-css-modules'
import styles from '../Swap.scss'

import config from 'app-config'
import { isMobile } from 'react-device-detect'

import FeeControler from '../FeeControler/FeeControler'
import SwapProgress from './SwapProgress/SwapProgress'
import SwapList from './SwapList/SwapList'
import DepositWindow from './DepositWindow/DepositWindow'
import paddingForSwapList from 'shared/helpers/paddingForSwapList'

@CSSModules(styles)
export default class EthToBtcLike extends Component {
  _fields = null

  constructor(props) {
    super()
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
      paddingContainerValue: 0,
      enabledButton: false,
      isAddressCopied: false,
      flow: this.swap.flow.state,
      isShowingGhostScript: false,
      currencyAddress: currencyData.address,
    }

    this.signTimer = null
    this.confirmTimer = null

  }

  componentWillMount() {
    this.swap.on('state update', this.handleFlowStateUpdate)

  }

  componentDidMount() {
    const { swap, flow: { isSignFetching, isMeSigned, step } } = this.state
    this.changePaddingValue()
    window.addEventListener('resize', this.updateWindowDimensions)
    this.updateWindowDimensions()
    this.signTimer = setInterval(() => {
      if (!this.state.flow.isMeSigned) {
        this.signSwap()
      } else {
        clearInterval(this.signTimer)
      }
    }, 3000)

    this.confirmTimer = setInterval(() => {
      if (this.state.flow.step === 3) {
        this.confirmScriptChecked()
      } else {
        clearInterval(this.confirmGhostTimer)
      }
    }, 3000)
  }

  componentWillUnmount() {
    this.swap.off('state update', this.handleFlowStateUpdate)
    window.removeEventListener('resize', this.updateWindowDimensions)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.flow !== this.state.flow) {
      this.changePaddingValue()
    }
  }

  updateWindowDimensions = () => {
    this.setState({ windowWidth: window.innerWidth })
  }

  changePaddingValue = () => {
    const { flow: { step } } = this.state
    this.setState(() => ({
      paddingContainerValue: paddingForSwapList({ step }),
    }))
  }

  confirmScriptChecked = () => {
    const {
      verifyScriptFunc,
    } = this._fields

    this.swap.flow[this.verifyScriptFunc]()
  }

  handleFlowStateUpdate = (values) => {
    const {
      swap,
      flow: {
        isMeSigned,
      },
    } = this.state

    const { currencyName } = this._fields
    /** todo - not used - remove **/
    const stepNumbers = {
      1: 'sign',
      2: 'wait-lock-ghost',
      3: 'verify-script',
      4: 'sync-balance',
      5: 'lock-eth',
      6: 'wait-withdraw-eth',
      7: 'withdraw-ghost',
      8: 'finish',
      9: 'end',
    }

    this.setState({
      flow: values,
    })

    this.changePaddingValue()

  }

  signSwap = () => {
    this.swap.flow.sign()
    this.setState(() => ({
      signed: true,
    }))
  }

  toggleScript = () => {
    this.setState({
      isShowingScript: !this.state.isShowingScript,
    })
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

    const { currencyAddress, flow, isShowingScript, swap, currencyData, signed, paddingContainerValue, buyCurrency, sellCurrency, windowWidth } = this.state
    const stepse = flow.step

    return (
      <div>
        <div styleName="swapContainer" style={(isMobile && (windowWidth < 569)) ? { paddingTop: paddingContainerValue } : { paddingTop: 0 }}>
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
                        name="EthToBtcLike"
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
          />
          <div styleName="swapContainerInfo">{children}</div>
        </div>
      </div>
    )
  }
}
