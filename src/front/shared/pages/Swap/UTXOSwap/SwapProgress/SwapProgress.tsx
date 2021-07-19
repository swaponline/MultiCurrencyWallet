import React, { Component, Fragment } from 'react'
import styles from './SwapProgress.scss'
import CSSModules from 'react-css-modules'
import crypto from 'crypto'

import { BigNumber } from 'bignumber.js'
import { Link as LinkTo } from 'react-router-dom'
import { injectIntl, FormattedMessage } from 'react-intl'

import Timer from '../../Timer/Timer'
import { Button, TimerButton } from 'components/controls'
import PleaseDontLeaveWrapper from './PleaseDontLeaveWrapper'

import { constants, links, ethToken } from 'helpers'
import { localisedUrl } from 'helpers/locale'
import metamask from 'helpers/metamask'

type ComponentProps = {
  flow: IUniversalObj
  swap: IUniversalObj
  history: IUniversalObj
  signed: boolean
  locale: string
  wallets: { [key: string]: string }
  fields: { [key: string]: string }
}

type ComponentState = {
  flow: IUniversalObj
  swap: IUniversalObj
  signed: boolean
  enabledButton: boolean
  refundError: boolean
  steps: Function[]
  buyCurrency: string
  sellCurrency: string
  secret: string
  stepValue: number
}

@CSSModules(styles, { allowMultiple: true })
class SwapProgress extends Component<ComponentProps, ComponentState> {
  swap = null
  _fields = null
  wallets = null
  history = null
  locale = null
  timer = null
  isSellCurrencyEthOrEthToken = null

  static defaultProps = {
    flow: {},
    whiteLogo: false,
  }

  constructor(props) {
    super(props)
    const {
      flow,
      swap,
      signed,
      wallets,
      history,
      locale,
      fields,
    } = props

    this._fields = fields
    this.swap = swap
    this.wallets = wallets
    this.history = history
    this.locale = locale

    //@ts-ignore: strictNullChecks
    this.isSellCurrencyEthOrEthToken = ethToken.isEthOrEthToken({ name: swap.sellCurrency })

    this.state = {
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
    //@ts-ignore: strictNullChecks
    this.history.push(localisedUrl(this.locale, '/wallet'))
  }

  onPushGoToTxPage = () => {
    const {
      state: {
        flow,
        swap,
      },
      _fields: {
        //@ts-ignore: strictNullChecks
        currencyName,
        //@ts-ignore: strictNullChecks
        withdrawTransactionHash,
        //@ts-ignore: strictNullChecks
        explorerLink,
        //@ts-ignore: strictNullChecks
        etherscanLink,
      },
    } = this

    if (flow.ethSwapWithdrawTransactionHash && swap.sellCurrency === currencyName) {
      window.open(`${etherscanLink}/tx/${flow.ethSwapWithdrawTransactionHash}`, '_blank')
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
        //@ts-ignore: strictNullChecks
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
    //@ts-ignore: strictNullChecks
    this.swap.on('state update', this.handleFlowStateUpdate)
    this.handleBarProgress()
    localStorage.setItem(constants.localStorage.startSwap, Date.now().toString())
    this.reloadPage()
  }

  componentWillUnmount() {
    //@ts-ignore: strictNullChecks
    this.swap.off('state update', this.handleFlowStateUpdate)
    //@ts-ignore: strictNullChecks
    clearTimeout(this.timer)
  }

  reloadPage = () => {
    //@ts-ignore: strictNullChecks
    this.timer = setTimeout(() => {
      //@ts-ignore: strictNullChecks
      const startSwapTime: number = new BigNumber(localStorage.getItem(constants.localStorage.startSwap)).toNumber()

      //@ts-ignore: strictNullChecks
      if (this.swap.flow.isFinished) {
        //@ts-ignore: strictNullChecks
        clearTimeout(this.timer)
      }

      const isSwapPage = window.location.pathname.includes("swaps")

      if (((Date.now() - startSwapTime) > 600 * 1000) && isSwapPage) {
        console.warn('UPS!!! SWAP IS FROZEN - RELOAD')
        localStorage.removeItem(constants.localStorage.startSwap)
        //@ts-ignore: strictNullChecks
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
      //@ts-ignore: strictNullChecks
      scriptCreatingTransactionHash,
      //@ts-ignore: strictNullChecks
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

  tryRefund = async () => {
    //@ts-ignore: strictNullChecks
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

    // this.swap.flow.submitSecret(secret)
  }

  confirmScriptChecked = () => {
    const {
      //@ts-ignore: strictNullChecks
      verifyScriptFunc,
    } = this._fields
    // this.swap.flow[verifyScriptFunc]()
  }

  render() {
    const {
      steps,
      flow,
      swap,
      swap: {
        flow: {
          isTakerMakerModel,
          isUTXOSide,
          state :{
            isEthContractFunded,
            utxoScriptValues,
            scriptBalance,
            isFinished,
            isRefunded,
            isStoppedSwap
          }
        },
      },
      signed,
      buyCurrency,
      sellCurrency,
      enabledButton,
      refundError,
    } = this.state

    const {
      //@ts-ignore: strictNullChecks
      currencyName,
      //@ts-ignore: strictNullChecks
      scriptValues,
      //@ts-ignore: strictNullChecks
      explorerLink,
      //@ts-ignore: strictNullChecks
      etherscanLink,
      //@ts-ignore: strictNullChecks
      withdrawTransactionHash,
    } = this._fields

    //@ts-ignore: strictNullChecks
    const showWalletButton = (!this.swap.destinationBuyAddress)
      //@ts-ignore: strictNullChecks
      || (this.swap.destinationBuyAddress === this.wallets[buyCurrency.toUpperCase()])

    const canRefund = this.checkCanRefund()

    let _refundTx = false

    if (flow.refundTransactionHash) {
      _refundTx = flow.refundTransactionHash.transactionHash || flow.refundTransactionHash
    }

    const canBeRefunded = utxoScriptValues && (isUTXOSide ? scriptBalance > 0 : isEthContractFunded)
    const isDeletedSwap = isFinished || isRefunded

    return (
      <div styleName="overlay">
        <div styleName="container">
          <div styleName="stepContainer">
            <div styleName="stepInfo">
              {!isDeletedSwap && canBeRefunded && (
                  <Timer lockTime={utxoScriptValues.lockTime * 1000} />
                )
              }

              {signed && flow.step < 4 && (
                <div>
                  <strong>
                    <a href={`${etherscanLink}/tx/${flow.signTransactionHash}`} target="_blank" rel="noopener noreferrer">
                      <FormattedMessage id="swappropgress193" defaultMessage="Sign ETH transaction: {transaction}" values={{ transaction: flow.signTransactionHash }} />
                    </a>
                  </strong>
                </div>
              )}

              {(flow.utxoScriptValues && !flow.isFinished && !flow.isEthWithdrawn) && flow.refundTxHex && (
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
                          : `${etherscanLink}/tx/${_refundTx}`
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
                          enabledButton={this.willEnable}
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
              {flow.step === 4 && flow.waitUnlockUTXO && (
                <strong styleName="attention">
                  <FormattedMessage
                    id="Swap_OwnerHasLockedUTX"
                    defaultMessage="Swap paused because you has unconfirmed transaction in mempool. Waiting confirm"
                  />
                </strong>
              )}
              {flow.step <= 5 && flow.participantHasLockedUTXO && (
                <strong styleName="attention">
                  <FormattedMessage
                    id="Swap_SellerHasLockedUTX"
                    defaultMessage="Swap paused because owner has unconfirmed transaction in mempool. Waiting confirm"
                  />
                </strong>
              )}
              {flow.step <= 5 && flow.utxoFundError && (
                <strong styleName="attention">
                  <FormattedMessage
                    id="Swap_UtxoBroadcastError"
                    defaultMessage="Swap paused because broadcast tx ended with error &quot;{error}&quot;"
                    values={{
                      error: flow.utxoFundError,
                    }}
                  />
                </strong>
              )}
              {metamask.isConnected() && (
                (!this.isSellCurrencyEthOrEthToken && flow.step === 6)
                || (this.isSellCurrencyEthOrEthToken && flow.step === 5 && flow.isUTXOScriptOk)
              ) && (
                <strong styleName="metamask_attention">
                  <FormattedMessage
                    id="Swap_MetamaskAttention"
                    defaultMessage="Please confirm the transaction in your &quot;{walletName}&quot; wallet"
                    values={{
                      walletName: metamask.web3connect.getProviderTitle(),
                    }}
                  />
                </strong>
              )}
              {flow.step > 3 && !flow.isRefunded && !flow.isFinished  && !this.isSellCurrencyEthOrEthToken &&
                <PleaseDontLeaveWrapper isBtcLike={flow.secret ? flow.secret : false} />
              }
            </div>

            {flow.ethSwapWithdrawTransactionHash && !this.isSellCurrencyEthOrEthToken && (
              <strong styleName="transaction">
                <a
                  href={`${etherscanLink}/tx/${flow.ethSwapWithdrawTransactionHash}`}
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

export default injectIntl(SwapProgress)