import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import actions from 'redux/actions'

import styles from './SwapProgress.scss'
import CSSModules from 'react-css-modules'

import crypto from 'crypto'
import swapApp from 'swap.app'
import config from 'app-config'

import { constants, links } from 'helpers'
import { localisedUrl } from 'helpers/locale'

import Link from 'sw-valuelink'
import { injectIntl, FormattedMessage } from 'react-intl'

import Timer from '../Timer/Timer'
import Logo from 'components/Logo/Logo'
import { Button } from 'components/controls'
import Input from 'components/forms/Input/Input'

import Title from 'components/PageHeadline/Title/Title'
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'
import SwapController from '../SwapController'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'

import BtcToEth from './SwapProgressText/BtcToEth'
import BtcToEthTokens from './SwapProgressText/BtcToEthTokens'
import EthToBtc from './SwapProgressText/EthToBtc'
import EthTokensToBtc from './SwapProgressText/EthTokensToBtc'

import * as animation from './images'
import finishSvg from './images/finish.svg'


@injectIntl
@CSSModules(styles, { allowMultiple: true })
export default class SwapProgress extends Component {

  static propTypes = {
    flow: PropTypes.object,
  }

  static defaultProps = {
    flow: {},
    whiteLogo: false,
  }

  constructor({ flow, step, swap, styles, tokenItems, signed }) {
    super()

    const currenciesBTCTransaction = ['BTC', 'USDT']
    const tokens = tokenItems.map(item => item.currency)
    const currenciesETHTransaction = tokens.concat('ETH')

    this.swap = swap

    this.state = {
      step,
      swap,
      signed,
      enabledButton: false,
      currenciesBTCTransaction,
      currenciesETHTransaction,
      flow,
      steps: flow.steps,
      buyCurrency: swap.buyCurrency,
      sellCurrency: this.swap.sellCurrency,
      btcScriptValues: this.swap.btcScriptValues,
      secret: crypto.randomBytes(32).toString('hex'),
      stepValue: 0,
    }
  }

  componentDidMount() {
    this.swap.on('state update', this.handleFlowStateUpdate)
    this.handleBarProgress()
  }

  componentWillUnmount() {
    this.swap.off('state update', this.handleFlowStateUpdate)
  }


  handleBarProgress = () => {
    const { swap: { sellCurrency, flow: { stepNumbers, state: { step } } } } = this.state
    const first = stepNumbers.sign
    const sixth = sellCurrency === 'BTC' ? stepNumbers[`withdraw-eth`] : stepNumbers[`wait-withdraw-eth`]
    const seventh = sellCurrency === 'BTC' ? stepNumbers.finish : stepNumbers[`withdraw-btc`]
    const eighth = sellCurrency === 'BTC' ? stepNumbers.end : stepNumbers.finish

    if (step === first) {
      this.setState({
        stepValue: 1,
      })
    }
    if (step === sixth) {
      this.setState({
        stepValue: 2,
      })
    }
    if (step === seventh) {
      this.setState({
        stepValue: 3,
      })
    }
    if (step >= eighth) {
      this.setState({
        stepValue: 4,
      })
    }
  }

  handleFlowStateUpdate = (values) => {
    this.setState({
      flow: values,
    })

    this.handleBarProgress()

  }


  // TODO add animation css, if the app will have error and try to on 10s step, will show the 9th of animathin

  handleStepChangeImage = (step) => {
    if (step < 10) {
      return <img src={animation[`icon${step}`]} alt="step" />
    }
    if (step === 10) {
      // eslint-disable-next-line
      return <img src={animation['icon9']} alt="step" />
    }
  }

  tryRefund = () => {
    this.swap.flow.tryRefund()
    this.setState(() => ({ enabledButton: false }))
  }

  willEnable = () => {
    this.setState(() => ({ enabledButton: true }))
  }

  submitSecret = () => {
    const { secret } = this.state

    this.swap.flow.submitSecret(secret)
  }

  confirmBTCScriptChecked = () => {
    this.swap.flow.verifyBtcScript()
  }

  render() {
    const {
      step,
      steps,
      flow,
      swap,
      signed,
      buyAmount,
      sellAmount,
      buyCurrency,
      sellCurrency,
      enabledButton,
      btcScriptValues,
      currenciesBTCTransaction,
      currenciesETHTransaction,
      stepValue,
    } = this.state

    const progress = Math.floor(90 * stepValue)
    const finishIcon = <img src={finishSvg} alt="finishIcon" />

    return (
      <div styleName="overlay">
        <div styleName="container">
          <div styleName="stepContainer">
            <SwapController swap={swap} />
            <div styleName="progressContainer">
              <div styleName={progress > 180 ? 'progress-pie-chart gt-50' : 'progress-pie-chart'}>
                <div styleName="ppc-progress">
                  <div styleName="ppc-progress-fill" style={{ transform: `rotate(${progress}deg)` }} />
                </div>
              </div>
              <div styleName="step">
                <div styleName="stepImg">
                  {flow.isFinished ? finishIcon : this.handleStepChangeImage(flow.step)}
                </div>
              </div>
            </div>
            <div styleName="stepInfo">
              <div styleName="stepInfo">

                {
                  this.props.name === 'BtcToEth' && <BtcToEth step={flow.step} flow={flow} swap={swap} />
                }
                {
                  this.props.name === 'EthToBtc' && <EthToBtc step={flow.step} flow={flow} swap={swap} />
                }
                {
                  this.props.name === 'BtcToEthTokens' && <BtcToEthTokens step={flow.step} flow={flow} swap={swap} />
                }
                {
                  this.props.name === 'EthTokensToBtc' && <EthTokensToBtc step={flow.step} flow={flow} swap={swap} />
                }
              </div>
              {signed && flow.step < 4 && (
                <div>
                  <strong>
                    <a href={`${config.link.etherscan}/tx/${flow.signTransactionHash}`} target="_blank" rel="noopener noreferrer">
                      <FormattedMessage id="swappropgress193" defaultMessage="Sign ETH transaction: {transaction}" values={{ transaction: flow.signTransactionHash }} />
                    </a>
                  </strong>
                </div>
              )}
              {(flow.btcScriptValues && !flow.isFinished && !flow.isEthWithdrawn) && flow.refundTxHex && (
                <div>
                  <a
                    href="https://wiki.swap.online/faq/my-swap-got-stuck-and-my-bitcoin-has-been-withdrawn-what-to-do/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FormattedMessage id="swappropgress192" defaultMessage="How to refund your money ?" />
                  </a>
                  <FormattedMessage id="swappropgress333" defaultMessage="Refund hex transaction: " />
                  <code> {flow.refundTxHex} </code>
                </div>
              )}
              {
                flow.refundTransactionHash && (
                  <div styleName="refundTransaction">
                    <strong>
                      <a
                        href={swap.sellCurrency === 'BTC'
                          ? `${config.link.bitpay}/tx/${flow.refundTransactionHash}`
                          : `${config.link.etherscan}/tx/${flow.refundTransactionHash}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FormattedMessage id="swapprogress254" defaultMessage="Refund transaction: " />
                        <span styleName="refundTransactionHash">{flow.refundTransactionHash}</span>
                      </a>
                    </strong>
                  </div>
                )
              }

              {flow.step > swap.flow.stepNumbers[`wait-lock-${buyCurrency.toLowerCase()}`]
              && !flow.isFinished
              && !flow.isEthWithdrawn
              && currenciesBTCTransaction.includes(buyCurrency) &&
              <Fragment>
                {enabledButton &&
                  <div styleName="btnRefund">
                    <Button gray onClick={this.tryRefund()}>
                      <FormattedMessage id="swapprogress270" defaultMessage="Try Refaund" />
                    </Button>
                  </div>
                }
                <div styleName="timerRefund">
                  <Timer
                    lockTime={flow.btcScriptValues.lockTime * 1000}
                    enabledButton={() => this.setState(() => ({ enabledButton: true }))}
                  />
                </div>
              </Fragment>
              }
              {flow.step === swap.flow.stepNumbers[`wait-lock-${buyCurrency.toLowerCase()}`]
              && !flow.isFinished
              && !flow.isBtcWithdrawn
              && currenciesETHTransaction.includes(buyCurrency) &&
              <Fragment>
                <div styleName="btnRefund">
                  {enabledButton &&
                    <Button gray onClick={this.tryRefund}>
                      <FormattedMessage id="swapprogress377" defaultMessage="Try refund" />
                    </Button>
                  }
                </div>
                <div styleName="timerRefund">
                  <Timer
                    lockTime={flow.btcScriptValues.lockTime * 1000}
                    enabledButton={() => this.setState(() => ({ enabledButton: true }))}
                  />
                </div>
              </Fragment>
              }
              {flow.step === 2 && swap.sellCurrency === 'BTC' &&
                <Button brand onClick={this.submitSecret()} >
                  <FormattedMessage id="swapFinishedGoHome289" defaultMessage="Submit the Secret" />
                </Button>
              }
              {flow.step === 3 && currenciesETHTransaction.includes(swap.sellCurrency) &&
                <Button brand onClick={this.confirmBTCScriptChecked()} >
                  <FormattedMessage id="swapFinishedGoHome298" defaultMessage="Everything is OK. Continue" />
                </Button>
              }
            </div>
            {(flow.ethSwapWithdrawTransactionHash && swap.sellCurrency === 'BTC') &&  (
              <strong styleName="transaction">
                <a
                  href={`${config.link.etherscan}/tx/${flow.ethSwapWithdrawTransactionHash}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <FormattedMessage id="swappropgress207" defaultMessage="{transaction}" values={{ transaction: flow.ethSwapWithdrawTransactionHash }} />
                </a>
              </strong>
            )}
            {flow.btcSwapWithdrawTransactionHash && (
              <strong styleName="transaction">
                <a
                  href={`${config.link.bitpay}/tx/${flow.btcSwapWithdrawTransactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FormattedMessage id="swappropgress218" defaultMessage="{transaction}" values={{ transaction: flow.btcSwapWithdrawTransactionHash }} />
                </a>
              </strong>
            )}
          </div>
        </div>
      </div>
    )
  }
}
