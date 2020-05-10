import React, { PureComponent, Fragment } from 'react'

import Swap from 'swap.swap'
import SwapApp from 'swap.app'

import cssModules from 'react-css-modules'
import styles from './Swap.scss'

import { connect } from 'redaction'
import helpers, { links, constants, request, apiLooper } from 'helpers'
import { isMobile } from 'react-device-detect'
import actions from 'redux/actions'
import { Link } from 'react-router-dom'

import { swapComponents } from './swaps'
import Share from './Share/Share'
import EmergencySave from './EmergencySave/EmergencySave'
import { injectIntl, FormattedMessage } from 'react-intl'
import { localisedUrl } from 'helpers/locale'
import DeleteSwapAfterEnd from './DeleteSwapAfterEnd'
import { Button } from 'components/controls'
import ShowBtcScript from './ShowBtcScript/ShowBtcScript'
import CopyToClipboard from 'react-copy-to-clipboard'

import axios from 'axios'

import config from 'app-config'


const isWidgetBuild = config && config.isWidget

@injectIntl
@connect(({
  user: { ethData, btcData, tokensData, activeFiat },
  ipfs: { peer },
  rememberedOrders,
}) => ({
  activeFiat,
  items: [ethData, btcData],
  tokenItems: [...Object.keys(tokensData).map(k => (tokensData[k]))],
  currenciesData: [ethData, btcData],
  tokensData: [...Object.keys(tokensData).map(k => (tokensData[k]))],
  errors: 'api.errors',
  checked: 'api.checked',
  decline: rememberedOrders.savedOrders,
  deletedOrders: rememberedOrders.deletedOrders,
  peer,
}))

@cssModules(styles, { allowMultiple: true })
export default class SwapComponent extends PureComponent {

  /*
    ================================================================
    This is debug information without any secret and private data.
    This information can help me resolve  problems.
    Contact me https://t.me/sashanoxon with any questions
  */
  sendSwapDebugInformation = (orderId) => {
    const {
      swap: {
        flow: {
          state: {
            step,
            btcScriptValues,
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
          btcScriptValues
        }
        const sendedJSON = JSON.stringify(sendedData)

        localStorage.setItem('axiosSwaps', JSON.stringify(swapsId))
        clearInterval(this.sendDebugInfoTimer)

        const message = `Swap enter to step 3 JSON(${sendedJSON}) - ${document.location.host}`
        try {
          return axios({
            // eslint-disable-next-line max-len
            url: `https://noxon.wpmix.net/counter.php?msg=${encodeURI(message)}`,
            method: 'post',
          }).catch(e => console.error(e))
        } catch (error) {
          console.error(error)
        }
      }
    }
  }
  /* ================================================================ */

  constructor() {
    super()

    this.state = {
      isAddressCopied: false,
      stepToHide: 0,
      swap: null,
      isMy: false,
      hideAll: false,
      ethBalance: null,
      currencyData: null,
      isAmountMore: null,
      SwapComponent: null,
      continueSwap: true,
      enoughBalance: true,
      depositWindow: false,
      isShowingBitcoinScript: false,
      isShowDevInformation: false,
      shouldStopCheckSendingOfRequesting: false,
      waitWithdrawOther: false,
      isFaucetRequested: false,
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
        actions.user.getExchangeRate(item.currency, activeFiat.toLocaleUpperCase())
          .then(exRate => {
            const amount = exRate * Number(item.amount)

            if (Number(amount) >= 50) {
              this.setState(() => ({ isAmountMore: 'enable' }))
            } else {
              this.setState(() => ({ isAmountMore: 'disable' }))
            }
          })
      })

      window.swap = swap

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
      actions.notifications.show(constants.notifications.ErrorNotification, { error: 'Sorry, but this order do not exsit already' })
      this.props.history.push(localisedUrl(links.exchange))
    }

    // @Info
    // Тут на самом деле не удачно подобранно название переменной
    // decline подразумевается, не отклоненный ордер, а начавшийся свап по ордеру
    // Если к этому ордеру будет отправлен еще один запрос на свап, то он будет отклонене (decline)
    if (!this.props.decline.includes(orderId)) {
      this.setSaveSwapId(orderId)
    }
  }

  componentDidMount() {
    const { swap, deletedOrders } = this.state
    const { flow } = swap
    const { step } = flow.state

    const { match: { params: { orderId } }, decline } = this.props

    if (step >= 4 && !decline.includes(orderId)) {
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

        if (isFinallyFinished || isStoppedSwap) {
          clearInterval(checkingCycle)
          return
        }

        this.checkEnoughFee()
        this.requestingWithdrawFee()
        this.isBalanceEnough()
        this.checkFailSwap()
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
      hideAll: true,
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
    }).then((rv) => {
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

  toggleInfo = (a, b) => {
    this.setState({
      isShowDevInformation: !a,
      isShowingBitcoinScript: !b,
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
      hideAll,
      swap,
      SwapComponent,
      currencyData,
      isAmountMore,
      ethData,
      continueSwap,
      enoughBalance,
      depositWindow,
      ethAddress,
      isShowingBitcoinScript,
      isShowDevInformation,
      requestToFaucetSended,
      stepToHide,
      isAddressCopied,
      waitWithdrawOther,
    } = this.state

    if (!swap || !SwapComponent || !peer || !isAmountMore) {
      return null
    }

    const isFinished = (swap.flow.state.step >= (swap.flow.steps.length - 1))
    return (
      <Fragment>
        {!hideAll ?
          <div styleName={isMobile ? 'swap swapMobile' : 'swap'}>
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
            >
              <p styleName="reloadText" title="reload the page" role="presentation" onClick={() => window.location.reload()}>
                <FormattedMessage
                  id="swapprogressDONTLEAVE22"
                  defaultMessage="The swap was stuck? Try to reload page"
                />
              </p>
              <Share flow={swap.flow} />
              <EmergencySave flow={swap.flow} onClick={() => this.toggleInfo(isShowDevInformation, true)} isShowDevInformation={isShowDevInformation} />
              <ShowBtcScript
                btcScriptValues={swap.flow.state.btcScriptValues}
                onClick={() => this.toggleInfo(!false, isShowingBitcoinScript)}
                isShowingBitcoinScript={isShowingBitcoinScript} />
              {peer === swap.owner.peer && (<DeleteSwapAfterEnd swap={swap} />)}
            </SwapComponent>
          </div> :
          <div>
            <h3 styleName="canceled" /* eslint-disable-line */ onClick={this.goWallet}>
              <FormattedMessage id="swappropgress327" defaultMessage="this Swap is canceled" />
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
