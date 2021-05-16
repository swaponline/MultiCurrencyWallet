import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'
import { constants } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from '../Swap.scss'

import SwapProgress from './SwapProgress/SwapProgress'
import SwapList from './SwapList/SwapList'
import FeeControler from '../FeeControler/FeeControler'
import FailControler from '../FailControler/FailControler'
import DepositWindow from './DepositWindow/DepositWindow'
import SwapController from '../SwapController'


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
      ethBalance,
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
    const {
      flow: {
        isSignFetching,
        isMeSigned,
        isStoppedSwap,
        step,
      },
    } = this.state

    if (isStoppedSwap) return
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
    this.confirmTimer = setInterval(() => {
      if (this.state.flow.step === 3) {
        this.confirmScriptChecked()
      } else {
        clearInterval(this.confirmTimer)
      }
    }, 3000)
    */

    this.requestMaxAllowance()
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

  signSwap = () => {
    //@ts-ignore: strictNullChecks
    this.swap.flow.sign()
    this.setState(() => ({
      signed: true,
    }))
  }

  
  requestMaxAllowance = () => {
    //@ts-ignore: strictNullChecks
    const { sellCurrency, sellAmount } = this.swap
    //@ts-ignore: strictNullChecks
    const { ethTokenSwap } = this.swap.flow
    // TODO: replace actions with erc20, bep20 ...
    actions.erc20.setAllowance({
      name: sellCurrency,
      to: ethTokenSwap.address, // swap contract address
      targetAllowance: sellAmount,
    })
  }

  render() {
    const {
      children,
      disabledTimer,
      continueSwap,
      enoughBalance,
      history,
      ethAddress,
      requestToFaucetSended,
      onClickCancelSwap,
      locale,
      wallets,
    }  = this.props

    const {
      currencyAddress,
      flow,
      enabledButton,
      isAddressCopied,
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
            <SwapController swap={swap} />
            <SwapList
              enoughBalance={enoughBalance}
              flow={flow}
              swap={swap}
              onClickCancelSwap={onClickCancelSwap}
              fields={this._fields}
              swapName="EthTokenToBtcLike"
            />
            {!enoughBalance && flow.step === 4
              ? (
                <div styleName="swapDepositWindow">
                  <DepositWindow currencyData={currencyData} swap={swap} flow={flow} tokenItems={tokenItems} fields={this._fields} />
                </div>
              )
              : (
                <Fragment>
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
                </Fragment>
              )
            }
          </div>
        </div>
        <div styleName="swapContainerInfo">{children}</div>
      </div>
    )
  }
}
