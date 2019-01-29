import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import actions from 'redux/actions'

import styles from './SwapProgress.scss'
import CSSModules from 'react-css-modules'

import { constants, links } from 'helpers'
import { localisedUrl } from 'helpers/locale'

import Link from 'sw-valuelink'
import { injectIntl, FormattedMessage } from 'react-intl'

import crypto from 'crypto'
import swapApp from 'swap.app'
import config from 'app-config'
import animation from './images'
import Timer from '../Timer/Timer'
import Logo from 'components/Logo/Logo'
import { Button } from 'components/controls'
import Input from 'components/forms/Input/Input'
import Title from 'components/PageHeadline/Title/Title'
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import BuyBitcoin from './SwapComponetsTexts/BuyBitcoin'
import SellBitcoin from './SwapComponetsTexts/SellBitcoin'


@injectIntl
@CSSModules(styles, { allowMultiple: true })
export default class SwapProgress extends Component {


  static defaultProps = {
    data: {},
    whiteLogo: false,
  }

  constructor({ flow, step, swap, styles, tokenItems }) {
    super()

    const currenciesBTCTransaction = ['BTC', 'USDT']
    const tokens = tokenItems.map(item => item.currency)
    const currenciesETHTransaction = tokens.concat('ETH')

    this.swap = swap

    this.state = {
      step,
      swap,
      styles,
      enabledButton: false,
      currenciesBTCTransaction,
      currenciesETHTransaction,
      flow: this.swap.flow.state,
      steps: swap.flow.state.steps,
      buyCurrency: swap.buyCurrency,
      sellCurrency: this.swap.sellCurrency,
      btcScriptValues: this.swap.btcScriptValues,
      secret: crypto.randomBytes(32).toString('hex'),
      destinationBuyAddress: (this.swap.destinationBuyAddress ? this.swap.destinationBuyAddress : swapApp.shared().services.auth.accounts.eth.address),
    }
  }

  componentDidMount() {
    this.swap.on('state update', this.handleFlowStateUpdate)
    const { flow, sellCurrency, buyCurrency, swap, currenciesBTCTransaction, currenciesETHTransaction } = this.state

    let timer
    timer = setInterval(() => {
      if (!flow.isParticipantSigned && flow.step === swap.flow.stepNumbers.sign && currenciesBTCTransaction.includes(sellCurrency)) {
        this.confirmAddress()
      }
      if (!flow.isSignFetching && !flow.isMeSigned && flow.step === swap.flow.stepNumbers.sign && currenciesETHTransaction.includes(sellCurrency)) {
        this.signSwap()
      }
      if (this.state.flow.step === swap.flow.stepNumbers[`submit-secret`] && currenciesBTCTransaction.includes(sellCurrency)) {
        this.submitSecret()
      }
      if (this.state.flow.step === swap.flow.stepNumbers[`verify-script`] && currenciesETHTransaction.includes(sellCurrency)) {
        this.confirmBTCScriptChecked()
      }
    }, 1000)
  }

  componentWillUnmount() {
    this.swap.off('state update', this.handleFlowStateUpdate)
  }


  handleFlowStateUpdate = (values) => {
    this.setState({
      flow: values,
    })
  }

  tryRefund = () => {
    this.swap.flow.tryRefund()
    this.setState(() => ({ enabledButton: false }))
  }

  confirmAddress = () => {
    this.swap.setDestinationBuyAddress(this.state.destinationBuyAddress)
    this.setState({ destinationAddressTimer : false })
  }

  submitSecret = () => {
    this.props.swap.flow.submitSecret(this.state.secret)
  }

  signSwap = () => {
    this.swap.flow.sign()
  }

  confirmBTCScriptChecked = () => {
    this.swap.flow.verifyBtcScript()
  }

  // TODO add animation css

  handleStepChangeImage = (step) => {
    if (step < 10) {
      return <img src={animation[`icon${step}`]} alt="step" />
    }
    if (step === 10) {
      // eslint-disable-next-line
      return <img src={animation['icon9']} alt="step" />
    }
  }

  handleGoHome = () => {
    const { intl: { locale } } = this.props
    this.props.history.push(localisedUrl(locale, links.home))
  }

  render() {
    const {
      flow,
      swap,
      step,
      steps,
      buyAmount,
      sellAmount,
      buyCurrency,
      sellCurrency,
      enabledButton,
      btcScriptValues,
      destinationBuyAddress,
      currenciesBTCTransaction,
      currenciesETHTransaction,
    } = this.state

    const progress = Math.floor(360 / (this.swap.flow.steps.length - 1) * this.state.flow.step)

    const linked = Link.all(this, 'destinationBuyAddress')

    linked.destinationBuyAddress.check((value) => value !== '', 'Please enter ETH address for tokens')

    return (
      <div styleName="overlay">
        <div styleName="container">
          <div styleName="stepContainer">
            <div styleName="swapInfo">
              {
                this.swap.id && (
                  <strong>
                    {this.swap.sellAmount.toFixed(6)}
                    {' '}
                    {sellCurrency} &#10230; {' '}
                    {this.swap.buyAmount.toFixed(6)}
                    {' '}
                    {buyCurrency}
                  </strong>
                )
              }
            </div>
            <div styleName="progressContainer">
              <div styleName={progress > 180 ? 'progress-pie-chart gt-50' : 'progress-pie-chart'}>
                <div styleName="ppc-progress">
                  <div styleName="ppc-progress-fill" style={{ transform: `rotate(${progress}deg)` }} />
                </div>
              </div>
              <div styleName="step">
                <div styleName="stepImg">
                  {this.handleStepChangeImage(this.state.flow.step)}
                </div>
              </div>
            </div>
            <div styleName="stepInfo">
              <div styleName="stepInfo">
                {this.props.name === `BTC2${buyCurrency}` && <BuyBitcoin swap={swap} />}
                {this.props.name === `${sellCurrency}2BTC` && <SellBitcoin swap={swap} />}
              </div>
              {flow.step === swap.flow.stepNumbers.sign && flow.signTransactionHash && (
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
                  <FormattedMessage id="BtcToEth248" defaultMessage="Refund hex transaction: " />
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
                      <Button gray onClick={this.confirmBTCScriptChecked}>
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
                      <Button gray onClick={this.confirmBTCScriptChecked}>
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
              {flow.isFinished && !flow.isFinished && !flow.isBtcWithdrawn && currenciesETHTransaction.includes(buyCurrency) &&
                <Button green onClick={this.handleGoHome} >
                  <FormattedMessage id="swapFinishedGoHome" defaultMessage="Return to home page" />
                </Button>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}
