import React, { PureComponent, Fragment } from 'react'

import Swap from 'swap.swap'
import SwapApp from 'swap.app'

import cssModules from 'react-css-modules'
import styles from './Swap.scss'

import { connect } from 'redaction'
import helpers, { links, constants, apiLooper } from 'helpers'
import request from 'common/utils/request'
import { isMobile } from 'react-device-detect'
import actions from 'redux/actions'
import { Link } from 'react-router-dom'

import { swapComponents } from './swaps'
import Share from './Share/Share'
import Debug from './Debug/Debug'
import { injectIntl, FormattedMessage } from 'react-intl'
import { localisedUrl } from 'helpers/locale'
import DeleteSwapAfterEnd from './DeleteSwapAfterEnd'
import { Button } from 'components/controls'
import CopyToClipboard from 'react-copy-to-clipboard'

import feedback from 'shared/helpers/feedback'

import config from 'app-config'


const isWidgetBuild = config && config.isWidget
const isDark = localStorage.getItem(constants.localStorage.isDark)

@injectIntl
@connect(({
  user: { ethData, btcData, ghostData, nextData, tokensData, activeFiat },
  pubsubRoom: { peer },
  rememberedOrders,
}) => ({
  activeFiat,
  items: [ethData, btcData, ghostData, nextData],
  tokenItems: [...Object.keys(tokensData).map(k => (tokensData[k]))],
  currenciesData: [ethData, btcData, ghostData, nextData],
  tokensData: [...Object.keys(tokensData).map(k => (tokensData[k]))],
  errors: 'api.errors',
  checked: 'api.checked',
  savedOrders: rememberedOrders.savedOrders,
  deletedOrders: rememberedOrders.deletedOrders,
  peer,
}))

@cssModules(styles, { allowMultiple: true })
export default class SwapComponent extends PureComponent<any, any> {

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

  constructor() {
    //@ts-ignore
    super()

    this.state = {
      isAddressCopied: false,
      swap: null,
      isMy: false,
      ethBalance: null,
      currencyData: null,
      isAmountMore: null,
      SwapComponent: null,
      continueSwap: true,
      enoughBalance: true,
      depositWindow: false,
      isShowDebug: false,
      shouldStopCheckSendingOfRequesting: false,
      waitWithdrawOther: false,
      isFaucetRequested: false,
      isSwapCancelled: false,
    }
  }

  componentWillMount() {
    const { items, tokenItems, currenciesData, tokensData, intl: { locale }, deletedOrders } = this.props
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
      const swap = new Swap(orderId, SwapApp.shared())
      console.log('Swap flow:', swap.flow._flowName);

      window.swap = swap
      window.flow = swap.flow

      const SwapComponent = swapComponents[swap.flow._flowName]
      const ethData = items.filter(item => item.currency === 'ETH')
      const currencyData = items.concat(tokenItems)
        .filter(item => item.currency === swap.sellCurrency.toUpperCase())[0]
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
            //@ts-ignore
            const amount = exRate * Number(item.amount)

            if (Number(amount) >= 50) {
              this.setState(() => ({ isAmountMore: 'enable' }))
            } else {
              this.setState(() => ({ isAmountMore: 'disable' }))
            }
          })
      })

      this.setState(() => ({
        swap,
        ethData,
        SwapComponent,
        currencyData,
        ethAddress: ethData[0].address,
      }))

      /* hide my orders */
      // disable for now TODO
      // actions.core.hideMyOrders()

    } catch (error) {
      console.error(error)
      actions.notifications.show(constants.notifications.ErrorNotification, {
        error: 'Sorry, but this order do not exsit already'
      })
      this.props.history.push(localisedUrl(links.exchange))
    }

    if (!this.props.savedOrders.includes(orderId)) {
      this.setSaveSwapId(orderId)
    }
  }

  componentDidMount() {
    const { swap, deletedOrders } = this.state
    const { flow } = swap
    const { step } = flow.state

    const { match: { params: { orderId } }, savedOrders } = this.props

    if (step >= 4 && !savedOrders.includes(orderId)) {
      this.saveThisSwap(orderId)
    }

    if (swap !== null) {
      console.log('checkingCycle')
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
        if (!this.checkIsConfirmed()) window.location.reload()
      }, 30000)

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
    const { swap: { id, flow: { state: { isStoppedSwap } } } } = this.state

    if (!isStoppedSwap) {
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

  checkIsFinished = () => {
    const { swap: { id, flow: { state: { isFinished, step, isRefunded } } } } = this.state

    if (isFinished || step > 7 || isRefunded) {
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
    window.swap = null
  }

  setSaveSwapId = (orderId) => {
    let swapsId = JSON.parse(localStorage.getItem('swapId'))

    if (swapsId === null || swapsId.length === 0) {
      swapsId = []
    }
    if (!swapsId.includes(orderId)) {
      swapsId.push(orderId)
    }
    localStorage.setItem('swapId', JSON.stringify(swapsId))
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
    //@ts-ignore
    if (typeof swap.flow.checkOtherSideRefund === 'function') {
      //@ts-ignore
      const isOtherSideRefunded = await swap.flow.checkOtherSideRefund()
      if (isOtherSideRefunded) {
        this.setState(() => ({
          continueSwap: false,
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
    const isShowDebug = this.state.isShowDebug;
    this.setState({
      isShowDebug: !isShowDebug,
    })
  }

  goWallet = () => {
    const { intl: { locale } } = this.props
    this.props.history.push(localisedUrl(locale, '/'))
  }

  handleCopyAddress = (e) => {
    this.setState({
      isAddressCopied: true,
    }, () => {
      setTimeout(() => {
        this.setState({
          isAddressCopied: false,
        })
      }, 500)
    })
  }

  render() {
    const { peer, tokenItems, history, intl: { locale } } = this.props
    const {
      swap,
      SwapComponent,
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
    } = this.state

    if (!swap || !SwapComponent || !peer || !isAmountMore) {
      return null
    }

    return (
      <Fragment>
        {!isSwapCancelled ?
          <div styleName={`${isMobile ? 'swap swapMobile' : 'swap'} ${isDark ? 'dark' : ''}`}>
            <SwapComponent
              tokenItems={tokenItems}
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
            {/*<Share flow={swap.flow} />*/}
            <div>
              <p styleName="reloadText" role="presentation">
                <FormattedMessage
                  id="SwapStuck"
                  defaultMessage="The swap was stuck? Try to "
                />
                <span styleName="pseudolink" onClick={() => this.toggleDebug()}>
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

              {isShowDebug &&
                <Debug flow={swap.flow} />
              }

              {peer === swap.owner.peer &&
                <DeleteSwapAfterEnd swap={swap} />
              }
            </div>
          </div>
          :
          <div>
            <h3 styleName="canceled" onClick={this.goWallet}>
              <FormattedMessage id="swappropgress327" defaultMessage="This swap is canceled" />
            </h3>
            <div>
              <h3 styleName="refHex">
                <FormattedMessage
                  id="swappropgress400"
                  defaultMessage="Refund is taking automatically"
                />
              </h3>
            </div>
          </div>
        }
      </Fragment>
    )
  }
}
