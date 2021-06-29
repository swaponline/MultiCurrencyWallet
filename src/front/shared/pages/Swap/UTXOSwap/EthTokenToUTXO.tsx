import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'

import CSSModules from 'react-css-modules'
import styles from '../Swap.scss'

import SwapProgress from './SwapProgress/SwapProgress'
import SwapList from './SwapList/SwapList'
import FeeControler from '../FeeControler/FeeControler'
import FailControler from '../FailControler/FailControler'
import SwapController from '../SwapController'
import SwapPairInfo from './SwapPairInfo'


@CSSModules(styles)
export default class EthTokenToUTXO extends Component<any, any> {

  _fields = null
  swap = null
  signTimer = null
  confirmTimer = null

  constructor(props) {
    super(props)

    const {
      swap,
      currencyData,
      tokenItems,
      fields,
    } = props

    this.swap = swap

    this.state = {
      swap,
      currencyData,
      tokenItems,
      signed: false,
      enabledButton: false,
      isAddressCopied: false,
      //@ts-ignore: strictNullChecks
      flow: this.swap.flow.state,
      currencyAddress: currencyData.address,
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
    const { flow: { isStoppedSwap } } = this.state
    if (isStoppedSwap) return

    this.requestMaxAllowance()
  }

  reportError = (error) => {
    console.group('%c EthTokenToUTXO swap', 'color: red;')
    console.error('error: ', error)
    console.log('%c Stack trace', 'color: orange;')
    console.trace()
    console.groupEnd()

    throw new Error(error)
  }

  confirmScriptChecked = () => {
    //@ts-ignore: strictNullChecks
    this.swap.flow[this._fields.verifyScriptFunc]()
  }

  handleFlowStateUpdate = (values) => {
    this.setState({
      flow: values,
    })
  }

  requestMaxAllowance = () => {
    //@ts-ignore: strictNullChecks
    const { sellCurrency, sellAmount, flow } = this.swap
    const { ethTokenSwap } = flow
    const { standard } = ethTokenSwap.options

    try {
      actions[standard].setAllowance({
        name: sellCurrency,
        to: ethTokenSwap.address, // swap contract address
        targetAllowance: String(sellAmount),
      })
    } catch (error) {
      this.reportError(error)
    }
  }

  render() {
    const {
      children,
      continueSwap,
      enoughBalance,
      history,
      ethAddress,
      onClickCancelSwap,
      locale,
      wallets,
    }  = this.props

    const {
      flow,
      currencyData,
      tokenItems,
      signed,
      swap,
    } = this.state

    const { canCreateEthTransaction, isFailedTransaction, isFailedTransactionError, gasAmountNeeded } = flow

    return (
      <div>
        <div styleName="swapContainer">
          <div>
            {swap.id && <SwapPairInfo swap={swap} />}
            <SwapController swap={swap} />
            <SwapList
              enoughBalance={enoughBalance}
              currencyData={currencyData}
              tokenItems={tokenItems}
              flow={flow}
              swap={swap}
              onClickCancelSwap={onClickCancelSwap}
              fields={this._fields}
              swapName="EthTokenToBtcLike"
            />
            {!continueSwap
              ? (
                <Fragment>
                  {
                    !canCreateEthTransaction && (
                      <FeeControler ethAddress={ethAddress} gasAmountNeeded={gasAmountNeeded} fields={this._fields} />
                    )
                  }
                  {
                    isFailedTransaction && (
                      <FailControler ethAddress={ethAddress} message={isFailedTransactionError} fields={this._fields} />
                    )
                  }
                </Fragment>
              )
              : (
                <SwapProgress
                  flow={flow}
                  swap={swap}
                  tokenItems={tokenItems}
                  history={history}
                  locale={locale}
                  wallets={wallets}
                  signed={signed}
                  fields={this._fields}
                />
              )
            }
          </div>
        </div>
        {children && <div styleName="swapContainerInfo">{children}</div>}
      </div>
    )
  }
}
