import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import actions from 'redux/actions'

import styles from './SwapProgress.scss'
import CSSModules from 'react-css-modules'

import crypto from 'crypto'
import swapApp from 'swap.app'
import config from 'app-config'

import { constants, links, ethToken } from 'helpers'
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
import PleaseDontLeaveWrapper from './SwapProgressText/PleaseDontLeaveWrapper'

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

  constructor({ flow, step, swap, styles, tokenItems, signed, wallets, history, locale }) {
    super()

    this.swap = swap

    this.wallets = wallets
    this.history = history
    this.locale = locale

    this.state = {
      step,
      swap,
      signed,
      enabledButton: false,
      flow,
      steps: flow.steps,
      buyCurrency: swap.buyCurrency,
      sellCurrency: this.swap.sellCurrency,
      secret: crypto.randomBytes(32).toString('hex'),
      stepValue: 0,
    }
  }

  onPushGoToWallet = () => {
    const { buyCurrency } = this.state

    switch (buyCurrency) {
      case 'BTC':
        this.history.push(localisedUrl(this.locale, '/Bitcoin-wallet'))
        break
      case 'ETH':
        this.history.push(localisedUrl(this.locale, '/Ethereum-wallet'))
        break
      default:
        this.history.push(localisedUrl(this.locale, `/${buyCurrency.toLowerCase()}-wallet`))
    }
  }

  onPushGoToTxPage = () => {
    const {
      flow,
      swap,
    } = this.state

    if (flow.ethSwapWithdrawTransactionHash && swap.sellCurrency === 'BTC') {
      window.open(`${config.link.etherscan}/tx/${flow.ethSwapWithdrawTransactionHash}`, '_blank')
    }
    if (flow.btcSwapWithdrawTransactionHash) {
      window.open(`${config.link.bitpay}/tx/${flow.btcSwapWithdrawTransactionHash}`, '_blank')
    }
  }

  handleBarProgress = () => {
    const { swap: { sellCurrency, flow: { stepNumbers, state: { step } } } } = this.state
    const first = stepNumbers.sign
    const sixth = sellCurrency === 'BTC' ? stepNumbers[`withdraw-eth`] : stepNumbers[`wait-withdraw-eth`]
    const seventh = sellCurrency === 'BTC' ? stepNumbers.finish : stepNumbers[`withdraw-btc`]
    const eighth = sellCurrency === 'BTC' ? stepNumbers.end : stepNumbers.finish

    if (step >= first && step < sixth) {
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

  componentDidMount() {
    this.swap.on('state update', this.handleFlowStateUpdate)
    this.handleBarProgress()
  }

  componentWillUnmount() {
    this.swap.off('state update', this.handleFlowStateUpdate)
  }

  checkCanRefund = () => {
    const { sellCurrency, buyCurrency, swap } = this.state

    if (!swap) {
      return false
    }

    const { state, stepNumbers } = swap.flow

    const getFinalCurrency = (currency) => {
      const isCurrencyEthOrEthToken = ethToken.isEthOrEthToken({ name: currency })

      if (isCurrencyEthOrEthToken) {
        return 'Eth'
      }

      return currency.charAt(0).toUpperCase() + currency.slice(1).toLowerCase()
    }

    const finalBuyCurrency = getFinalCurrency(buyCurrency)
    const finalSellCurrency = getFinalCurrency(sellCurrency)

    const isStartStepForRefund = state.step >= stepNumbers[`lock-${finalSellCurrency.toLowerCase()}`]
    const isEndStepForRefund = state.step <= stepNumbers[`withdraw-${finalBuyCurrency.toLowerCase()}`]

    const canRefund = isStartStepForRefund
      && isEndStepForRefund
      && state.btcScriptValues
      && !state.isFinished
      && !state.isRefunded
      && !state[`is${finalBuyCurrency}Withdrawn`]
/*
    console.warn('finalBuyCurrency', finalBuyCurrency)
    console.warn('finalSellCurrency', finalSellCurrency)
    console.warn('isStartStepForRefund', isStartStepForRefund)
    console.warn('isEndStepForRefund', isEndStepForRefund)
    console.warn('canRefund', canRefund)
*/
    return canRefund
  }

  handleFlowStateUpdate = (values) => {
    this.setState(() => ({
      flow: values,
    }))

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

  tryRefund = async () => {
    const { flow } = this.swap

    await flow.tryRefund()
      .then((result) => {
        console.warn('refundResult', result)
      })

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
      stepValue,
    } = this.state

    const progress = Math.floor(90 * stepValue)
    const finishIcon = <img src={finishSvg} alt="finishIcon" />
    const showWalletButton = (!this.swap.destinationBuyAddress)
      || (this.swap.destinationBuyAddress === this.wallets[buyCurrency.toUpperCase()])

    const isSellCurrencyEthOrEthToken = ethToken.isEthOrEthToken({ name: sellCurrency })
    const canRefund = this.checkCanRefund()

    const swapTexts = (
      <Fragment>
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
      </Fragment>
    )

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
                <h1 styleName="stepHeading">
                  {
                    stepValue < 4
                      ? (
                        <PleaseDontLeaveWrapper>
                          {swapTexts}
                        </PleaseDontLeaveWrapper>
                      )
                      : swapTexts
                  }
                </h1>
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

              { canRefund &&
              <Fragment>
                { enabledButton
                    ? (
                        <div styleName="btnRefund">
                          <Button gray onClick={this.tryRefund}>
                            <FormattedMessage id="swapprogress270" defaultMessage="Try refund" />
                          </Button>
                        </div>
                      )
                    : (
                        <div styleName="timerRefund">
                          <Timer
                            lockTime={flow.btcScriptValues.lockTime * 1000}
                            enabledButton={() => this.setState(() => ({ enabledButton: true }))}
                          />
                        </div>
                      )
                }
              </Fragment>
              }

              {flow.step === 2 && !isSellCurrencyEthOrEthToken &&
                <Button brand onClick={this.submitSecret()} >
                  <FormattedMessage id="swapFinishedGoHome289" defaultMessage="Submit the Secret" />
                </Button>
              }
              {flow.step === 3 && isSellCurrencyEthOrEthToken &&
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
            {flow.btcSwapWithdrawTransactionHash && swap.buyCurrency === 'BTC' && (
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
            {flow.isFinished && (
              <div styleName="finishButtonsHolder">
                {showWalletButton && (
                  <Button brand onClick={this.onPushGoToWallet}>
                    <FormattedMessage id="swapProgressGoToWallet" defaultMessage="Check balance" />
                  </Button>
                )}
                <Button gray onClick={this.onPushGoToTxPage}>
                  <FormattedMessage id="swapProgressGoToTxPage" defaultMessage="View TX in explorer" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}
