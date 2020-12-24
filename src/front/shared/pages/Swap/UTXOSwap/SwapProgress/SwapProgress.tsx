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
import { BigNumber } from 'bignumber.js'
import { Link as LinkTo } from 'react-router-dom'

import { injectIntl, FormattedMessage } from 'react-intl'

import Timer from '../../Timer/Timer'
import { Button, TimerButton } from 'components/controls'

import SwapController from '../../SwapController'
import PleaseDontLeaveWrapper from './SwapProgressText/PleaseDontLeaveWrapper'

import BtcLikeToEth from './SwapProgressText/BtcLikeToEth'
import BtcLikeToEthToken from './SwapProgressText/BtcLikeToEthToken'
import EthToBtcLike from './SwapProgressText/EthToBtcLike'
import EthTokenToBtcLike from './SwapProgressText/EthTokenToBtcLike'
import metamask from 'helpers/metamask'



import * as animation from './images'
import finishSvg from './images/finish.svg'


const isDark = localStorage.getItem(constants.localStorage.isDark)
@injectIntl
@CSSModules(styles, { allowMultiple: true })
export default class SwapProgress extends Component<any, any> {
  swap = null
  _fields = null
  wallets = null
  history = null
  locale = null
  timer = null
  isSellCurrencyEthOrEthToken = null


  static propTypes = {
    flow: PropTypes.object,
  }

  static defaultProps = {
    flow: {},
    whiteLogo: false,
  }

  constructor(props) {
    super(props)
    const {
      flow,
      step,
      swap,
      styles,
      tokenItems,
      signed,
      wallets,
      history,
      locale,
      fields,
    } = props

    this._fields = fields


    console.log('SwapProgress fields', this._fields)

    this.swap = swap

    this.wallets = wallets
    this.history = history
    this.locale = locale

    this.isSellCurrencyEthOrEthToken = ethToken.isEthOrEthToken({ name: swap.sellCurrency })

    this.state = {
      step,
      swap,
      signed,
      enabledButton: false,
      refundError: false,
      flow,
      steps: flow.steps,
      buyCurrency: swap.buyCurrency,
      sellCurrency: swap.sellCurrency,
      secret: crypto.randomBytes(32).toString('hex'),
      stepValue: 0,
    }
  }

  onPushGoToWallet = () => {
    const { buyCurrency } = this.state

    this.history.push(localisedUrl(this.locale, '/wallet'))
  }

  onPushGoToTxPage = () => {
    const {
      state: {
        flow,
        swap,
      },
      _fields: {
        currencyName,
        withdrawTransactionHash,
        explorerLink,
      },
    } = this

    if (flow.ethSwapWithdrawTransactionHash && swap.sellCurrency === currencyName) {
      window.open(`${config.link.etherscan}/tx/${flow.ethSwapWithdrawTransactionHash}`, '_blank')
    }
    if (flow[withdrawTransactionHash]) {
      window.open(`${explorerLink}/tx/${flow[withdrawTransactionHash]}`, '_blank')
    }
  }

  handleBarProgress = () => {
    const {
      state: {
        swap: {
          sellCurrency,
          flow: {
            stepNumbers,
            state: {
              step,
            },
          },
        },
      },
      _fields: {
        currencyName,
      }
    } = this

    const first = stepNumbers.sign
    const sixth = sellCurrency === currencyName ? stepNumbers[`withdraw-eth`] : stepNumbers[`wait-withdraw-eth`]
    const seventh = sellCurrency === currencyName ? stepNumbers.finish : stepNumbers[`withdraw-${currencyName.toLowerCase()}`]
    const eighth = sellCurrency === currencyName ? stepNumbers.end : stepNumbers.finish

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
    localStorage.setItem(constants.localStorage.startSwap, Date.now().toString())
    this.reloadPage()
  }

  componentWillUnmount() {
    this.swap.off('state update', this.handleFlowStateUpdate)
    clearTimeout(this.timer)
  }

  reloadPage = () => {
    this.timer = setTimeout(() => {
      const startSwapTime: number = new BigNumber(localStorage.getItem(constants.localStorage.startSwap)).toNumber()

      if (this.swap.flow.isFinished) {
        clearTimeout(this.timer)
      }

      const isSwapPage = window.location.pathname.includes("swaps")

      if (((Date.now() - startSwapTime) > 600 * 1000) && isSwapPage) {
        console.warn('UPS!!! SWAP IS FROZEN - RELOAD')
        localStorage.removeItem(constants.localStorage.startSwap)
        clearTimeout(this.timer)
        window.location.reload()
      }
    }, 1000)
  }

  checkCanRefund = () => {
    const { sellCurrency, buyCurrency, swap } = this.state

    if (!swap) {
      return false
    }

    const { state, stepNumbers } = swap.flow

    const {
      scriptCreatingTransactionHash,
      withdrawTransactionHash,
    } = this._fields

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
    const isEndStepForRefund = state.step < stepNumbers[`withdraw-${finalBuyCurrency.toLowerCase()}`]

    const isStepForRefund = isStartStepForRefund && isEndStepForRefund

    const isNotFinished = !state.isFinished && !state.isRefunded

    const isCurrencyFunded = this.isSellCurrencyEthOrEthToken
      ? state.ethSwapCreationTransactionHash
      : state[scriptCreatingTransactionHash]

    const isCurrencyWithdrawn = this.isSellCurrencyEthOrEthToken
      ? state[withdrawTransactionHash]
      : state.ethSwapWithdrawTransactionHash

    const canRefund = isStepForRefund
      && isCurrencyFunded
      && isNotFinished
      && !isCurrencyWithdrawn

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

  handleFocusSecretInput = (event) => event.target.select();

  tryRefund = async () => {
    const { flow } = this.swap

    await flow.tryRefund()
      .then((result) => {
        if (!result) {
          this.setState(() => ({ refundError: true }))
          setTimeout(() => this.setState(() => ({ refundError: false })), 5000)
          return
        }

        this.setState(() => ({ enabledButton: false }))
      })
  }

  willEnable = () => {
    this.setState(() => ({ enabledButton: true }))
  }

  submitSecret = () => {
    const { secret } = this.state

    this.swap.flow.submitSecret(secret)
  }

  confirmScriptChecked = () => {
    const {
      verifyScriptFunc,
    } = this._fields
    this.swap.flow[verifyScriptFunc]()
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
      refundError,
      stepValue,
      isSecretCopied,
    } = this.state

    const {
      currencyName,
      scriptValues,
      explorerLink,
      withdrawTransactionHash,
    } = this._fields

    const progress = Math.floor(90 * stepValue)
    const finishIcon = <img src={finishSvg} alt="finishIcon" />
    const showWalletButton = (!this.swap.destinationBuyAddress)
      || (this.swap.destinationBuyAddress === this.wallets[buyCurrency.toUpperCase()])

    const canRefund = this.checkCanRefund()

    let _refundTx = false

    if (flow.refundTransactionHash) {
      _refundTx = flow.refundTransactionHash.transactionHash || flow.refundTransactionHash
    }

    /** todo **/
    const swapTexts = (
      <Fragment>
        {
          this.props.name === 'BtcLikeToEth' && <BtcLikeToEth step={flow.step} flow={flow} swap={swap} coinName={currencyName} />
        }
        {
          this.props.name === 'EthToBtcLike' && <EthToBtcLike step={flow.step} flow={flow} swap={swap} coinName={currencyName} />
        }
        {
          this.props.name === 'BtcLikeToEthToken' && <BtcLikeToEthToken step={flow.step} flow={flow} swap={swap} coinName={currencyName} />
        }
        {
          this.props.name === 'EthTokenToBtcLike' && <EthTokenToBtcLike step={flow.step} flow={flow} swap={swap} coinName={currencyName} />
        }
      </Fragment>
    )

    return (
      <div styleName={`overlay ${isDark ? 'dark' : ''}`}>
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

              <span styleName="stepHeading">
                {swapTexts}
              </span>

              {signed && flow.step < 4 && (
                <div>
                  <strong>
                    <a href={`${config.link.etherscan}/tx/${flow.signTransactionHash}`} target="_blank" rel="noopener noreferrer">
                      <FormattedMessage id="swappropgress193" defaultMessage="Sign ETH transaction: {transaction}" values={{ transaction: flow.signTransactionHash }} />
                    </a>
                  </strong>
                </div>
              )}

              {(flow[scriptValues] && !flow.isFinished && !flow.isEthWithdrawn) && flow.refundTxHex && (
                <div>
                  <a
                    href="https://wiki.swaponline.io/faq/my-swap-got-stuck-and-my-bitcoin-has-been-withdrawn-what-to-do/"
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
                _refundTx && (
                  <div styleName="refundTransaction">
                    <strong>
                      <a
                        href={swap.sellCurrency === currencyName
                          ? `${explorerLink}/tx/${_refundTx}`
                          : `${config.link.etherscan}/tx/${_refundTx}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FormattedMessage id="swapprogress254" defaultMessage="Refund transaction: " />
                        <span styleName="refundTransactionHash">{_refundTx}</span>
                      </a>
                    </strong>
                  </div>
                )
              }

              {canRefund &&
                <Fragment>
                  {enabledButton
                    ? (
                      <Fragment>
                        <div styleName="btnRefund">
                          <Button gray onClick={this.tryRefund}>
                            <FormattedMessage id="swapprogress270" defaultMessage="Try refund" />
                          </Button>
                        </div>
                        {refundError &&
                          <span styleName="tryAgain">
                            <FormattedMessage id="swapprogress271" defaultMessage="Try again in a few minutes" />
                          </span>
                        }
                      </Fragment>
                    )
                    : (
                      <div styleName="timerRefund">
                        <Timer
                          isRefund
                          lockTime={flow[scriptValues].lockTime * 1000}
                          cancelTime={(flow[scriptValues].lockTime - 7200) * 1000}
                          enabledButton={() => this.setState(() => ({ enabledButton: true }))}
                        />
                      </div>
                    )
                  }
                </Fragment>
              }

              {flow.step === 2 && !this.isSellCurrencyEthOrEthToken && (
                <TimerButton brand onClick={this.submitSecret.bind(this)} timeLeft={180} forceClick={true}>
                  <FormattedMessage id="swapFinishedGoHome289" defaultMessage="Submit the Secret" />
                </TimerButton>
              )}
              {flow.step === 3 && this.isSellCurrencyEthOrEthToken && (
                <TimerButton brand onClick={this.confirmScriptChecked.bind(this)} timeLeft={180} forceClick={true}>
                  <FormattedMessage id="swapFinishedGoHome298" defaultMessage="Everything is OK. Continue" />
                </TimerButton>
              )}

              {metamask.isConnected() && (
                (!this.isSellCurrencyEthOrEthToken && flow.step === 6)
                || (this.isSellCurrencyEthOrEthToken && flow.step === 5 && flow.isUTXOScriptOk)
              ) && (
                <strong styleName="externalWeb3Attention">
                  <FormattedMessage
                    id="Swap_MetamaskAttention"
                    defaultMessage="Please confirm the transaction in your &quot;{walletName}&quot; wallet"
                    values={{
                      walletName: metamask.web3connect.getProviderTitle(),
                    }}
                  />
                </strong>
              )}
              {flow.step > 3 && !this.isSellCurrencyEthOrEthToken &&
                <PleaseDontLeaveWrapper isBtcLike={flow.secret ? flow.secret : false} />
              }
            </div>

            {flow.ethSwapWithdrawTransactionHash && !this.isSellCurrencyEthOrEthToken && (
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
            {flow[withdrawTransactionHash] && this.isSellCurrencyEthOrEthToken && (
              <strong styleName="transaction">
                <a
                  href={`${explorerLink}/tx/${flow[withdrawTransactionHash]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FormattedMessage id="swappropgress218" defaultMessage="{transaction}" values={{ transaction: flow[withdrawTransactionHash] }} />
                </a>
              </strong>
            )}
            {flow.isFinished && (
              <div styleName="finishButtonsHolder">
                {showWalletButton && (
                  <LinkTo to="/wallet">
                    <Button brand onClick={this.onPushGoToWallet}>
                      <FormattedMessage id="swapProgressGoToWallet" defaultMessage="Check balance" />
                    </Button>
                  </LinkTo>
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
