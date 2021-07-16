
import React, { PureComponent, Fragment } from 'react'

import Swap from 'swap.swap'
import SwapApp from 'swap.app'

import cssModules from 'react-css-modules'
import styles from './Swap.scss'

import { connect } from 'redaction'
import helpers, { links, constants, apiLooper } from 'helpers'
import { isMobile } from 'react-device-detect'
import actions from 'redux/actions'

import { swapComponents } from './swaps'
import { createSwapApp } from "instances/newSwap";
import Debug from './Debug/Debug'
import { injectIntl, FormattedMessage } from 'react-intl'
import { localisedUrl } from 'helpers/locale'
import DeleteSwapAfterEnd from './DeleteSwapAfterEnd'

import feedback from 'shared/helpers/feedback'

@connect(({
  user: {
    ethData,
    bnbData,
    maticData,
    arbethData,
    btcData,
    ghostData,
    nextData,
    tokensData,
    activeFiat,
  },
  pubsubRoom: { peer },
  rememberedOrders,
}) => {
  const coinsData = [
    ethData,
    bnbData,
    maticData,
    arbethData,
    btcData,
    ghostData,
    nextData,
  ]

  return {
    activeFiat,
    items: [...coinsData],
    currenciesData: [...coinsData],
    tokensData: [...Object.keys(tokensData).map(k => (tokensData[k]))],
    savedOrders: rememberedOrders.savedOrders,
    peer,
  }
})

@cssModules(styles, { allowMultiple: true })
class SwapComponent extends PureComponent<any, any> {

  wallets: any
  checkingConfirmSuccessTimer: any
  checkingCycleTimer: any
  sendDebugInfoTimer: any



  /*
    ================================================================
    This is debug information without any secret and private data.
    This information can help me resolve problems.
    Contact me https://t.me/sashanoxon with any questions
  */
  sendSwapDebugInformation = (orderId) => {
    const {
      swap: {
        flow: {
          state: {
            step,
            utxoScriptValues,
          },
          state: flowState,
        },
        flow,
      },
      swap,
    } = this.state

    if (step >= 3) {
      //@ts-ignore: strictNullChecks
      let swapsId = JSON.parse(localStorage.getItem('axiosSwaps'))

      if (swapsId === null || swapsId.length === 0) {
        swapsId = []
      }
      if (!swapsId.includes(orderId)) {
        swapsId.push(orderId)

        const {
          id,
          buyCurrency,
          sellCurrency,
          buyAmount,
          sellAmount,
          destinationBuyAddress,
          destinationSellAddress,
          owner,
          participant,
        } = swap

        const sendedData = {
          id,
          buyCurrency,
          sellCurrency,
          buyAmount: buyAmount.toNumber(),
          sellAmount: sellAmount.toNumber(),
          destinationBuyAddress,
          destinationSellAddress,
          owner,
          participant,
          utxoScriptValues
        }
        const sendedJSON = JSON.stringify(sendedData)

        localStorage.setItem('axiosSwaps', JSON.stringify(swapsId))
        clearInterval(this.sendDebugInfoTimer)

        feedback.swap.started(sendedJSON)
      }
    }
  }
  /* ================================================================ */

  constructor(props) {
    super(props)

    this.state = {
      isAddressCopied: false,
      swap: null,
      isMy: false,
      currencyData: null,
      isAmountMore: null,
      ActiveSwap: null,
      continueSwap: true,
      enoughBalance: true,
      depositWindow: false,
      isShowDebug: false,
      shouldStopCheckSendingOfRequesting: false,
      waitWithdrawOther: false,
      isFaucetRequested: false,
      isSwapCancelled: false,
      errorInfo: '',
    }
  }


  async componentDidMount() {
    console.group('Swap page >%c didMount', 'color: green')

    const { items, currenciesData, tokensData } = this.props
    let { match: { params: { orderId } }, history, activeFiat } = this.props

    if (!!window.performance && window.performance.navigation.type === 2) {
      window.location.reload()
    }

    if (!orderId) {
      history.push(localisedUrl(links.exchange))
      return
    }

    this.wallets = {}
    currenciesData.forEach(item => {
      this.wallets[item.currency] = item.address
    })
    tokensData.forEach(item => {
      this.wallets[item.currency] = item.address
    })

    try {
      console.log('creating swap')
      console.log('orderId', orderId)
      console.log('SwapApp', window.SwapApp)
      if (window.SwapApp) {
        this.createSwap({ orderId, items, tokensData, activeFiat })
      } else {
        await actions.user.sign()
        await createSwapApp()
        this.createSwap({ orderId, items, tokensData, activeFiat })
      }

    } catch (error) {
      console.error(error)
      actions.notifications.show(constants.notifications.ErrorNotification, {
        error: 'Sorry, but this order does not exist already'
      })
      this.props.history.push(localisedUrl(links.exchange))
    }

    console.groupEnd()
  }

  createSwap(params) {
    const { orderId, items, tokensData, activeFiat } = params
    const swap = new Swap(orderId, SwapApp.shared())
    actions.core.rememberSwap(swap)
    window.active_swap = swap

    console.log('swap: ', swap)
    console.log('swap flow name:', swap.flow._flowName);

    const ActiveSwap = swapComponents[swap.flow._flowName]
    const ethData = items.filter(item => item.currency === 'ETH')
    const sellCurrency = swap.sellCurrency.toUpperCase()
    const currencyData = items.concat(tokensData)
      .filter(item => item.isToken ? item.tokenKey.toUpperCase() === sellCurrency : item.currency === sellCurrency)[0]
    const currencies = [
      {
        currency: swap.sellCurrency,
        amount: swap.sellAmount,
      },
      {
        currency: swap.buyCurrency,
        amount: swap.buyAmount,
      },
    ]

    currencies.forEach(item => {
      actions.user.getExchangeRate(item.currency, activeFiat.toLowerCase())
        .then(exRate => {
          const amount = exRate * Number(item.amount)

          if (Number(amount) >= 50) {
            this.setState(() => ({ isAmountMore: 'enable' }))
          } else {
            this.setState(() => ({ isAmountMore: 'disable' }))
          }
        })
    })

    console.log('setting swap into state (swap): ', swap)

    this.setState({
      swap,
      ethData,
      ActiveSwap,
      currencyData,
      ethAddress: ethData[0].address,
    }, this.afterComponentDidMount)

    /* hide my orders */
    // disable for now TODO
    // actions.core.hideMyOrders()

  }


  afterComponentDidMount() {
    const {
      swap,
      swap: {
        flow: {
          step,
        },
      },
    } = this.state

    const { match: { params: { orderId } }, savedOrders } = this.props

    if (step >= 4 && !savedOrders.includes(orderId)) {
      this.saveThisSwap(orderId)
    }

    if (swap !== null) {
      if (this.checkIsFinished() || this.checkStoppedSwap()) {
        return
      }
      this.sendDebugInfoTimer = setInterval(() => {
        this.sendSwapDebugInformation(orderId)
      }, 1000)

      const checkingCycle = setInterval(() => {
        const isFinallyFinished = this.checkIsFinished()
        const isStoppedSwap = this.checkStoppedSwap()

        if (isFinallyFinished) {
          feedback.swap.finished()
        }
        if (isStoppedSwap) {
          feedback.swap.stopped()
        }

        if (isFinallyFinished || isStoppedSwap) {
          clearInterval(checkingCycle)
          return
        }

        this.checkEnoughFee()
        this.requestingWithdrawFee()
        this.isBalanceEnough()
        this.checkFailSwap()
        this.checkOtherSideRefund()
      }, 5000)

      const checkingConfirmSuccess = setTimeout(() => {
        if (!this.checkIsConfirmed()) {
          window.location.reload()
        }
      }, 240_000) // seconds

      this.checkingConfirmSuccessTimer = checkingConfirmSuccess
      this.checkingCycleTimer = checkingCycle
    }
  }

  componentWillUnmount() {
    clearInterval(this.checkingCycleTimer)
    clearTimeout(this.checkingConfirmSuccessTimer)
    clearInterval(this.sendDebugInfoTimer)
  }

  checkStoppedSwap = () => {
    const {
      swap: {
        id,
        flow: {
          state: {
            isStoppedSwap,
            isFinished,
            isRefunded,
            isSwapTimeout,
          },
        },
      },
    } = this.state

    if (!isStoppedSwap || isFinished || isRefunded || isSwapTimeout) {
      return false
    }

    this.deleteThisSwap(id)

    this.setState(() => ({
      isSwapCancelled: true,
    }))

    return true
  }

  checkIsConfirmed = () => {
    const { swap: { flow: { state: { step } } } } = this.state
    return !(step === 1)
  }

  componentDidCatch(error, info) {
    this.setState(() => ({
      errorInfo: info,
    }))

    actions.notifications.show(
      constants.notifications.ErrorNotification,
      { error: error.message }
    )
  }

  checkIsFinished = () => {
    const {
      swap: {
        id,
        flow: {
          state: {
            isFinished,
            isSwapTimeout,
            step,
            isRefunded,
          },
        },
      },
    } = this.state

    if (isFinished || isSwapTimeout || step > 7 || isRefunded) {
      this.deleteThisSwap(id)
      return true
    }

    return false
  }

  saveThisSwap = (orderId) => {
    actions.core.rememberOrder(orderId)
  }

  deleteThisSwap = (orderId) => {
    actions.core.saveDeletedOrder(orderId)
    actions.core.forgetOrders(orderId)
  }

  isBalanceEnough = () => {
    const { swap } = this.state
    const { flow, sellCurrency } = swap
    const { step, balance, isBalanceEnough } = flow.state

    const isSellCurrencyEthOrEthToken = helpers.ethToken.isEthOrEthToken({ name: sellCurrency })
    const stepForCheckBalance = isSellCurrencyEthOrEthToken
      ? 4
      : 3

    if (!isBalanceEnough && step === stepForCheckBalance) {
      this.setState(() => ({ enoughBalance: false }))
    } else {
      this.setState(() => ({ enoughBalance: true }))
    }
  }

  requestingWithdrawFee = () => {
    const {
      swap: {
        flow: {
          state: {
            requireWithdrawFee,
            requireWithdrawFeeSended,
            withdrawRequestIncoming,
            withdrawRequestAccepted,
          },
        },
      },
    } = this.state

    if (requireWithdrawFee && !requireWithdrawFeeSended) {
      if (this.state.swap && this.state.swap.flow) {
        this.state.swap.flow.sendWithdrawRequest()
        this.setState({
          waitWithdrawOther: true,
        })
        window.setTimeout(() => {
          this.setState({
            waitWithdrawOther: false,
          })
        }, 1000 * 60 * 2)
      }
    }

    if (withdrawRequestIncoming && !withdrawRequestAccepted) {
      if (this.state.swap && this.state.swap.flow) {
        this.state.swap.flow.acceptWithdrawRequest()
      }
    }
  }

  sendRequestToFaucet = () => {
    const {
      swap: {
        owner,
        buyCurrency,
        buyAmount,
        sellCurrency,
        sellAmount,
      },
      isFaucetRequested,
      continueSwap,
    } = this.state

    if (isFaucetRequested) {
      return
    }

    this.setState(() => ({
      isFaucetRequested: true,
    }))

    apiLooper.post('faucet', '', {
      body: {
        eth: this.state.ethAddress,
        buyCurrency,
        buyAmount: buyAmount.toString(),
        sellCurrency,
        sellAmount: sellAmount.toString(),
      },
    }).then((rv: any) => {
      console.info('faucet answered', rv.txid)
      this.setState(() => ({
        continueSwap: true,
      }))
    }).catch((error) => {
      console.warn('faucet error:', error)
      this.setState(() => ({
        continueSwap: false,
      }))
    })
  }

  checkOtherSideRefund = async () => {
    const {
      swap: {
        flow,
      },
    } = this.state

    if (typeof flow.checkOtherSideRefund === 'function') {
      const isOtherSideRefunded = await flow.checkOtherSideRefund()
      if (isOtherSideRefunded) {
        this.setState(() => ({
          otherSideRefunded: true,
        }))
      }
    }
  }

  checkFailSwap = () => {
    const {
      swap: {
        flow: {
          state: {
            isFailedTransaction,
          },
        },
      },
      continueSwap,
    } = this.state

    if (!isFailedTransaction) {
      return
    }

    this.setState(() => ({
      continueSwap: false,
    }))
  }

  checkEnoughFee = () => {
    const {
      swap: {
        participantSwap,
        flow: {
          state: {
            canCreateEthTransaction,
          },
        },
      },
      currencyData: {
        currency,
      },
    } = this.state

    if (canCreateEthTransaction === false &&
      helpers.ethToken.isEthOrEthToken({ name: currency })
    ) {
      this.sendRequestToFaucet()
    } else {
      this.setState(() => ({
        continueSwap: true,
      }))
    }
  }

  toggleDebug = () => {
    this.setState((state) => ({
      isShowDebug: !state.isShowDebug,
    }))
  }

  goWallet = () => {
    const { intl: { locale } } = this.props
    this.props.history.push(localisedUrl(locale, '/'))
  }

  render() {
    const { peer, tokensData, history, intl: { locale } } = this.props
    const {
      swap,
      ActiveSwap,
      currencyData,
      isAmountMore,
      ethData,
      continueSwap,
      enoughBalance,
      depositWindow,
      ethAddress,
      isShowDebug,
      requestToFaucetSended,
      isAddressCopied,
      waitWithdrawOther,
      isSwapCancelled,
      errorInfo,
    } = this.state

    if (!swap || !ActiveSwap || !peer || !isAmountMore) {
      return null
    }

    return (
      <Fragment>
        {!isSwapCancelled ?
          <div styleName={`${isMobile ? 'swap swapMobile' : 'swap'}`}>
            <ActiveSwap
              tokenItems={tokensData}
              depositWindow={depositWindow}
              disabledTimer={isAmountMore === 'enable'}
              history={history}
              swap={swap}
              ethAddress={ethAddress}
              currencyData={currencyData}
              styles={styles}
              enoughBalance={enoughBalance}
              ethData={ethData}
              continueSwap={continueSwap}
              requestToFaucetSended={requestToFaucetSended}
              waitWithdrawOther={waitWithdrawOther}
              locale={locale}
              wallets={this.wallets}
            />
            <div>
              <p styleName="reloadText" role="presentation">
                <FormattedMessage
                  id="SwapStuck"
                  defaultMessage="The swap was stuck? Try to "
                />
                <span styleName="pseudolink" onClick={this.toggleDebug}>
                  <FormattedMessage
                    id="SwapDebug"
                    defaultMessage="debug"
                  />
                </span>
                <FormattedMessage
                  id="SwapOr"
                  defaultMessage=" or "
                />
                <span styleName="pseudolink" onClick={() => window.location.reload()}>
                  <FormattedMessage
                    id="SwapReload"
                    defaultMessage="reload the page"
                  />
                </span>
              </p>

              {peer === swap.owner.peer &&
                <DeleteSwapAfterEnd swap={swap} />
              }
            </div>
          </div>
          :
          <div styleName="canceledSwapInfo">
            <h3 styleName="canceled" onClick={this.goWallet}>
              <FormattedMessage id="swappropgress327" defaultMessage="This swap is canceled" />
            </h3>

            {errorInfo && (
              <div>
                {errorInfo}
              </div>
            )}

            <h3>
              <FormattedMessage
                id="swappropgress400"
                defaultMessage="Refund is taking automatically"
              />
            </h3>
            <div styleName="pseudolink" onClick={this.toggleDebug}>
              <FormattedMessage id="SwapDebug" defaultMessage="debug" />
            </div>
          </div>
        }

        {isShowDebug &&
          <Debug flow={swap.flow} />
        }
      </Fragment>
    )
  }
}

export default injectIntl(SwapComponent)
