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
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'

import BtcToEth from './SwapProgressText/BtcToEth'
import BtcToEthTokens from './SwapProgressText/BtcToEthTokens'
import EthToBtc from './SwapProgressText/EthToBtc'
import EthTokensToBtc from './SwapProgressText/EthTokensToBtc'

import * as animation from './images'


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
    }
  }

  componentDidMount() {
    this.swap.on('state update', this.handleFlowStateUpdate)
  }

  componentWillUnmount() {
    this.swap.off('state update', this.handleFlowStateUpdate)
  }

  handleFlowStateUpdate = (values) => {
    this.setState({
      flow: values,
    })
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

  handleGoHome = () => {
    const { intl: { locale } } = this.props
    this.props.history.push(localisedUrl(locale, links.home))
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
    } = this.state

    const progress = Math.floor(360 / (swap.flow.steps.length - 1) * this.state.flow.step)
    const isFinish = flow.step === swap.flow.steps.length - 1

    const finishSvg = (
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
        <circle
          className="path circle"
          fill="none"
          stroke="#3de25b"
          strokeWidth="6"
          strokeMiterlimit="10"
          cx="65.1"
          cy="65.1"
          r="62.1"
        />
        <polyline
          className="path check"
          fill="none"
          stroke="#3de25b"
          strokeWidth="6"
          strokeLinecap="round"
          strokeMiterlimit="10"
          points="100.2,40.2 51.5,88.8 29.8,67.5 "
        />
      </svg>)

    return (
      <div styleName="overlay">
        <div styleName="container">
          <div styleName="stepContainer">
            <div styleName="progressContainer">
              <div styleName={progress > 180 ? 'progress-pie-chart gt-50' : 'progress-pie-chart'}>
                <div styleName="ppc-progress">
                  <div styleName="ppc-progress-fill" style={{ transform: `rotate(${progress}deg)` }} />
                </div>
              </div>
              <div styleName="step">
                <div styleName="stepImg">
                  {isFinish ? finishSvg : this.handleStepChangeImage(flow.step)}
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
                      <FormattedMessage id="swappropgress246" defaultMessage="Sign ETH transaction: " />
                      {flow.signTransactionHash}
                    </a>
                  </strong>
                </div>
              )}
              <div styleName="transactionAll">
                {flow.ethSwapWithdrawTransactionHash && currenciesETHTransaction.includes(buyCurrency) && (
                  <strong>
                    <a
                      href={`${config.link.etherscan}/tx/${flow.ethSwapWithdrawTransactionHash}`}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <FormattedMessage id="swappropgress233" defaultMessage="ETH transaction: " />
                      {flow.ethSwapWithdrawTransactionHash}
                    </a>
                  </strong>
                )}
                {flow.btcSwapWithdrawTransactionHash && currenciesBTCTransaction.includes(buyCurrency) && (
                  <strong>
                    <a
                      href={`${config.link.bitpay}/tx/${flow.btcSwapWithdrawTransactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FormattedMessage id="swappropgress258" defaultMessage="BTC transaction: " />
                      {flow.btcSwapWithdrawTransactionHash}
                    </a>
                  </strong>
                )}
              </div>
              {(flow.btcScriptValues && !flow.isFinished && !flow.isEthWithdrawn) && flow.refundTxHex && (
                <div>
                  <a
                    href="https://wiki.swap.online/faq/my-swap-got-stuck-and-my-bitcoin-has-been-withdrawn-what-to-do/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FormattedMessage id="swappropgress332" defaultMessage="How refund your money ?" />
                  </a>
                  <FormattedMessage id="swappropgress333" defaultMessage="Refund hex transaction: " />
                  <code> {flow.refundTxHex} </code>
                </div>
              )}
              {
                flow.refundTransactionHash && (
                  <div>
                    <strong>
                      <a
                        href={`${config.link.etherscan}/tx/${flow.refundTransactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FormattedMessage id="swapprogress254" defaultMessage="Refund transaction: " />
                        {flow.refundTransactionHash}
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
                    enabledButton={() => this.setState({ enabledButton: true })}
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
                    enabledButton={() => this.setState({ enabledButton: true })}
                  />
                </div>
              </Fragment>
              }
              {flow.isFinished &&
                <Button green onClick={this.handleGoHome} >
                  <FormattedMessage id="swapFinishedGoHome" defaultMessage="Return to home page" />
                </Button>
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
          </div>
        </div>
      </div>
    )
  }
}
